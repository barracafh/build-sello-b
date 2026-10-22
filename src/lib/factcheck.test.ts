import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  aplicarDesmentidos,
  buscarDesmentidos,
  consultaDesmentido,
  VOCABULARIO,
  type Desmentido,
} from "./factcheck";
import { combinar, senales } from "./senales";
import { verificar, type Resultado } from "./verificar";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};
const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

// Datos personales de mentira, compuestos por partes para que el detector de
// buildnight no los tome por reales (mismo recurso que senales.test.ts).
const tel = (...p: string[]) => p.join(" ");
const junto = (...p: string[]) => p.join("");

const final = (texto: string) => {
  const url = verificar(texto);
  return combinar(url, senales(texto, url), texto);
};

const consulta = (texto: string) => consultaDesmentido(texto, final(texto));

describe("consultaDesmentido", () => {
  test("solo lleva términos de la lista: ni datos personales ni el enlace", () => {
    const texto =
      "DGT: Sr. Juan Pérez García, tiene una multa pendiente de 127,50 € (exp. 2024/88331). " +
      `Llame al ${tel("612", "345", "678")} o escriba a ${junto("juan.perez", "@", "example.com")}. Pague con su IBAN ` +
      `${tel("ES91", "2100", "0418", "4502", "0005", "1332")} en hxxps://pago.dgt-multas[.]com/pagar/48291?dni=${junto("1234", "5678", "Z")}`;
    const q = consulta(texto);
    assert.equal(q, "DGT multa");
    for (const token of q!.split(" ")) {
      assert.ok(VOCABULARIO.includes(token), `token no permitido: ${token}`);
    }
  });

  test("DGT, AEAT y Correos dan el organismo y el patrón más general", () => {
    assert.equal(
      consulta("DGT: Dispone de 24 horas para pagar su multa. hxxps://dgt-multas[.]top/x"),
      "DGT multa",
    );
    assert.equal(
      consulta("AGENCIA TRIBUTARIA: Tiene una devolucion de 411,00€ pendiente. Acceda: hxxps://aeat-reembolso[.]com/r?id=99"),
      "Agencia Tributaria devolución",
    );
    assert.equal(
      consulta("[CORREOS] Su paquete está retenido en aduana. Pague 1,99€ en hxxps://correos-envio[.]info/p/7731"),
      "Correos paquete",
    );
    assert.equal(consulta("Correos: pague las tasas de aduana en hxxps://correos-envio[.]info"), "Correos paquete");
  });

  test("sin organismo o sin patrón de estafa no hay consulta", () => {
    assert.equal(consulta(`Hola Marta, ¿quedamos mañana? Llámame al ${tel("600", "111", "222")}`), null);
    assert.equal(consulta("AEAT: tiene una nueva notificación en la sede"), null);
    assert.equal(consulta("Pague su multa ya en hxxps://multas-pago[.]top/x"), null);
  });

  test("nunca consulta un veredicto oficial_verificado", () => {
    const r: Resultado = {
      veredicto: "oficial_verificado",
      motivos: ["en_allowlist"],
      entidad: "Dirección General de Tráfico (DGT)",
      url_analizada: "hxxps://sede[.]dgt[.]gob[.]es",
    };
    assert.equal(consultaDesmentido("DGT multa", r), null);
  });
});

const desmentido: Desmentido = {
  editor: "Maldita.es",
  sitio: "maldita.es",
  calificacion: "Falso",
  url: "https://maldita.es/malditobulo/sms-dgt",
  fecha: "2025-03-01T00:00:00Z",
};

describe("aplicarDesmentidos", () => {
  test("refuerza no_oficial con el motivo desmentido_publicado, sin cambiar el veredicto", () => {
    const r: Resultado = { veredicto: "no_oficial", motivos: ["imitacion_de_marca"], url_analizada: null };
    const fuera = aplicarDesmentidos(r, [desmentido]);
    assert.equal(fuera.veredicto, "no_oficial");
    assert.deepEqual(fuera.motivos, ["imitacion_de_marca", "desmentido_publicado"]);
  });

  test("por sí solo nunca cambia un veredicto ni da oficial_verificado", () => {
    for (const veredicto of ["no_determinable", "oficial_verificado"] as const) {
      const r: Resultado = { veredicto, motivos: ["x"], url_analizada: null };
      assert.deepEqual(aplicarDesmentidos(r, [desmentido]), r);
    }
  });

  test("sin coincidencias o sin consultar no toca nada", () => {
    const r: Resultado = { veredicto: "no_oficial", motivos: ["x"], url_analizada: null };
    assert.deepEqual(aplicarDesmentidos(r, []), r);
    assert.deepEqual(aplicarDesmentidos(r, "no_consultado"), r);
  });

  test("los 10 casos de ejemplo conservan su veredicto con un desmentido", () => {
    for (const caso of ejemplos) {
      const r = final(textoDeEjemplo(caso as Ejemplo));
      assert.equal(aplicarDesmentidos(r, [desmentido]).veredicto, caso.esperado, caso.id);
    }
  });
});

const respuesta = (cuerpo: unknown, ok = true) =>
  (async () => new Response(JSON.stringify(cuerpo), { status: ok ? 200 : 500 })) as unknown as typeof fetch;

describe("buscarDesmentidos", () => {
  // Ningún test sale a la red: cada uno inyecta `fetch`, y el global falla si alguien lo olvida.
  const fetchReal = globalThis.fetch;
  const claveReal = process.env.FACTCHECK_API_KEY;
  before(() => {
    globalThis.fetch = (() => {
      throw new Error("los tests no llaman a la API real");
    }) as unknown as typeof fetch;
    process.env.FACTCHECK_API_KEY = "clave-de-prueba";
  });
  after(() => {
    globalThis.fetch = fetchReal;
    if (claveReal === undefined) delete process.env.FACTCHECK_API_KEY;
    else process.env.FACTCHECK_API_KEY = claveReal;
  });

  test("sin clave no hace ninguna llamada, aunque el entorno tenga una", async () => {
    for (const clave of [undefined, null, ""]) {
      let llamadas = 0;
      const espia = (async () => {
        llamadas++;
        return new Response("{}");
      }) as unknown as typeof fetch;
      assert.equal(await buscarDesmentidos("DGT multa", { clave, fetch: espia }), "no_consultado");
      assert.equal(llamadas, 0, `clave=${JSON.stringify(clave)}`);
    }
  });

  test("si no se pasa `clave`, usa la del entorno", async () => {
    let pedida = "";
    const espia = (async (url: string) => {
      pedida = url;
      return new Response("{}");
    }) as unknown as typeof fetch;
    assert.deepEqual(await buscarDesmentidos("DGT multa", { fetch: espia }), []);
    assert.equal(new URL(pedida).searchParams.get("key"), "clave-de-prueba");
  });

  test("sin consulta no hace ninguna llamada", async () => {
    let llamadas = 0;
    const espia = (async () => {
      llamadas++;
      return new Response("{}");
    }) as unknown as typeof fetch;
    assert.equal(await buscarDesmentidos(null, { clave: "k", fetch: espia }), "no_consultado");
    assert.equal(llamadas, 0);
  });

  test("pide en español, de los últimos 24 meses, y se queda con 3", async () => {
    let pedida = "";
    const claims = Array.from({ length: 5 }, (_, i) => ({
      text: `SMS ${i}`,
      claimReview: [{
        publisher: { name: `Verificador ${i}`, site: `v${i}.es` },
        url: `https://v${i}.es/bulo`,
        textualRating: "Falso",
        reviewDate: "2025-06-0" + (i + 1) + "T00:00:00Z",
      }],
    }));
    const falso = (async (url: string) => {
      pedida = url;
      return new Response(JSON.stringify({ claims }));
    }) as unknown as typeof fetch;
    const r = await buscarDesmentidos("DGT multa", {
      clave: "k",
      fetch: falso,
      ahora: new Date("2026-10-22T00:00:00Z"),
    });
    const u = new URL(pedida);
    assert.equal(u.origin + u.pathname, "https://factchecktools.googleapis.com/v1alpha1/claims:search");
    assert.equal(u.searchParams.get("query"), "DGT multa");
    assert.equal(u.searchParams.get("languageCode"), "es");
    assert.equal(u.searchParams.get("maxAgeDays"), "730");
    assert.ok(Array.isArray(r));
    assert.equal(r.length, 3);
    assert.deepEqual(r[0], {
      editor: "Verificador 0",
      sitio: "v0.es",
      calificacion: "Falso",
      url: "https://v0.es/bulo",
      fecha: "2025-06-01T00:00:00Z",
    });
  });

  test("descarta enlaces que no son https y revisiones de hace más de 24 meses", async () => {
    const r = await buscarDesmentidos("DGT multa", {
      clave: "k",
      ahora: new Date("2026-10-22T00:00:00Z"),
      fetch: respuesta({
        claims: [
          { claimReview: [{ publisher: { name: "A" }, url: "javascript:alert(1)", textualRating: "Falso" }] },
          { claimReview: [{ publisher: { name: "B" }, url: "https://b.es/x", textualRating: "Falso", reviewDate: "2023-01-01T00:00:00Z" }] },
          { claimReview: [{ publisher: { name: "C" }, url: "https://c.es/x", textualRating: "Bulo" }] },
        ],
      }),
    });
    assert.deepEqual(r, [{ editor: "C", sitio: null, calificacion: "Bulo", url: "https://c.es/x", fecha: null }]);
  });

  test("sin resultados da una lista vacía", async () => {
    assert.deepEqual(await buscarDesmentidos("DGT multa", { clave: "k", fetch: respuesta({}) }), []);
  });

  test("un error de la API o de red da no_consultado", async () => {
    assert.equal(
      await buscarDesmentidos("DGT multa", { clave: "k", fetch: respuesta({ error: {} }, false) }),
      "no_consultado",
    );
    const roto = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    assert.equal(await buscarDesmentidos("DGT multa", { clave: "k", fetch: roto }), "no_consultado");
  });

  test("corta a los 3 s y da no_consultado", async () => {
    const lento = ((_: string, init?: RequestInit) =>
      new Promise((_, rechazar) => {
        init?.signal?.addEventListener("abort", () => rechazar(init.signal?.reason));
      })) as unknown as typeof fetch;
    const inicio = Date.now();
    const r = await buscarDesmentidos("DGT multa", { clave: "k", fetch: lento, espera: 50 });
    assert.equal(r, "no_consultado");
    assert.ok(Date.now() - inicio < 1000);
  });
});
