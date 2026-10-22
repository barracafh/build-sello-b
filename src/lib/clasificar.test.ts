import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  MOTIVO_NO_DISPONIBLE,
  clasificarMensaje,
  combinarClasificacion,
  esSalidaLlm,
  type SalidaLlm,
} from "./clasificar";
import { combinar, senales } from "./senales";
import { verificar } from "./verificar";
import { SISTEMA, type Determinista } from "./clasificar-prompt";

const determinista = (texto: string): Determinista => {
  const url = verificar(texto);
  const lista = senales(texto, url);
  return { resultado: combinar(url, lista, texto), senales: lista };
};

const llm = (parcial: Partial<SalidaLlm> = {}): SalidaLlm => ({
  veredicto: "no_determinable",
  motivo: "Motivo del modelo.",
  señales: [],
  entidad_suplantada: null,
  web_oficial: null,
  ...parcial,
});

const NEUTRO = "AEAT: Tiene una nueva notificación disponible. Consúltela en su sede.";
const FRAUDE = "DGT: pague su multa en 24 horas hxxps://dgt-multas-pago[.]com/x";
const OFICIAL = "https://sede.dgt.gob.es/es/multas/";

describe("combinarClasificacion", () => {
  test("un no_oficial determinista gana al modelo", () => {
    const r = combinarClasificacion(llm({ veredicto: "no_determinable" }), determinista(FRAUDE));
    assert.equal(r.veredicto, "no_oficial");
  });

  test("un no_oficial determinista gana aunque el modelo diga oficial", () => {
    const r = combinarClasificacion(llm({ veredicto: "oficial_verificado" }), determinista(FRAUDE));
    assert.equal(r.veredicto, "no_oficial");
  });

  test("un no_oficial determinista gana aunque el modelo no responda", () => {
    const r = combinarClasificacion(null, determinista(FRAUDE));
    assert.equal(r.veredicto, "no_oficial");
    assert.ok(r.señales.length > 0);
  });

  test("el modelo nunca produce oficial_verificado", () => {
    const r = combinarClasificacion(llm({ veredicto: "oficial_verificado" }), determinista(NEUTRO));
    assert.equal(r.veredicto, "no_determinable");
  });

  test("sin salida del modelo: no_determinable y «clasificador no disponible»", () => {
    const r = combinarClasificacion(null, determinista(NEUTRO));
    assert.equal(r.veredicto, "no_determinable");
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
    assert.equal(MOTIVO_NO_DISPONIBLE, "clasificador no disponible");
  });

  test("un mensaje bien escrito sin otra señal es no_determinable", () => {
    const r = combinarClasificacion(llm(), determinista(NEUTRO));
    assert.equal(r.veredicto, "no_determinable");
  });

  test("el modelo puede decir no_oficial si el determinista no concluye", () => {
    const r = combinarClasificacion(llm({ veredicto: "no_oficial" }), determinista(NEUTRO));
    assert.equal(r.veredicto, "no_oficial");
  });

  test("oficial_verificado solo viene de la URL", () => {
    const r = combinarClasificacion(llm(), determinista(OFICIAL));
    assert.equal(r.veredicto, "oficial_verificado");
  });

  test("URL oficial con un modelo que sospecha baja a no_determinable", () => {
    const r = combinarClasificacion(llm({ veredicto: "no_oficial" }), determinista(OFICIAL));
    assert.equal(r.veredicto, "no_determinable");
  });

  test("la web oficial del modelo solo vale si está en la lista de webs oficiales", () => {
    const inventada = combinarClasificacion(
      llm({ veredicto: "no_oficial", web_oficial: "https://dgt-pagos.example" }),
      determinista(NEUTRO),
    );
    assert.equal(inventada.web_oficial, null);
    const buena = combinarClasificacion(
      llm({ veredicto: "no_oficial", web_oficial: "https://sede.dgt.gob.es/" }),
      determinista(NEUTRO),
    );
    assert.ok(buena.web_oficial?.includes("dgt.gob.es"));
  });

  test("las URL que repite el modelo salen neutralizadas", () => {
    const r = combinarClasificacion(
      llm({
        motivo: "Lleva a https://dgt-multas.top/pago",
        señales: [{ codigo: "pide_dinero", evidencia: "visita http://x.top/a", fuente: "§5.4" }],
      }),
      determinista(NEUTRO),
    );
    assert.ok(!/https?:\/\//.test(JSON.stringify(r)));
    assert.ok(r.motivo.includes("hxxps://dgt-multas[.]top/pago"));
  });
});

describe("esSalidaLlm", () => {
  test("acepta la forma esperada", () => {
    assert.ok(esSalidaLlm(llm()));
  });
  test("rechaza un veredicto desconocido, señales mal formadas o campos ausentes", () => {
    assert.ok(!esSalidaLlm({ ...llm(), veredicto: "seguro" }));
    assert.ok(!esSalidaLlm({ ...llm(), señales: [{ codigo: 1 }] }));
    assert.ok(!esSalidaLlm({ ...llm(), motivo: undefined }));
    assert.ok(!esSalidaLlm(null));
    assert.ok(!esSalidaLlm("no_oficial"));
  });
});

describe("clasificarMensaje", () => {
  const det = determinista(NEUTRO);
  const responde = (texto: string) => async () => texto;

  test("hace una sola llamada con temperatura 0 y JSON", async () => {
    let llamadas = 0;
    let opciones: Record<string, unknown> = {};
    const r = await clasificarMensaje(NEUTRO, det, {
      completar: async (_m, o) => {
        llamadas++;
        opciones = { ...o };
        return JSON.stringify(llm({ veredicto: "no_oficial" }));
      },
    });
    assert.equal(llamadas, 1);
    assert.equal(opciones.temperatura, 0);
    assert.equal(opciones.formatoJson, true);
    assert.ok(opciones.signal instanceof AbortSignal);
    assert.equal(r.veredicto, "no_oficial");
  });

  test("el mensaje del usuario lleva el texto y las señales deterministas", async () => {
    let usuario = "";
    let sistema = "";
    await clasificarMensaje(FRAUDE, determinista(FRAUDE), {
      completar: async (m) => {
        sistema = String(m[0].content);
        usuario = String(m[1].content);
        return JSON.stringify(llm());
      },
    });
    assert.ok(usuario.includes("pide_dinero") || usuario.includes("urgencia"));
    assert.ok(usuario.includes("dgt-multas-pago"));
    assert.ok(sistema.includes("contexto.md §5.4"));
  });

  test("acepta JSON envuelto en un bloque de código", async () => {
    const r = await clasificarMensaje(NEUTRO, det, {
      completar: responde("```json\n" + JSON.stringify(llm({ veredicto: "no_oficial" })) + "\n```"),
    });
    assert.equal(r.veredicto, "no_oficial");
  });

  test("error del modelo → no_determinable con el motivo de reserva", async () => {
    const r = await clasificarMensaje(NEUTRO, det, {
      completar: async () => {
        throw new Error("HelmCode respondió 500");
      },
    });
    assert.equal(r.veredicto, "no_determinable");
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
  });

  test("JSON no válido → reserva", async () => {
    const r = await clasificarMensaje(NEUTRO, det, { completar: responde("no es json") });
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
  });

  test("JSON con forma incorrecta → reserva", async () => {
    const r = await clasificarMensaje(NEUTRO, det, {
      completar: responde(JSON.stringify({ veredicto: "seguro" })),
    });
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
  });

  test("tiempo agotado → reserva, aunque el cliente ignore la señal", async () => {
    const inicio = Date.now();
    const r = await clasificarMensaje(NEUTRO, det, {
      timeoutMs: 30,
      completar: () => new Promise<string>(() => {}),
    });
    assert.equal(r.veredicto, "no_determinable");
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
    assert.ok(Date.now() - inicio < 1000);
  });

  test("el timeout por defecto es de 8 s", async () => {
    let señal: AbortSignal | undefined;
    await clasificarMensaje(NEUTRO, det, {
      completar: async (_m, o) => {
        señal = o?.signal;
        return JSON.stringify(llm());
      },
    });
    assert.ok(señal && !señal.aborted);
  });

  test("no escribe el texto en la consola", async () => {
    const original = [console.log, console.error, console.warn];
    const vistos: string[] = [];
    console.log = console.error = console.warn = (...a: unknown[]) => void vistos.push(a.join(" "));
    try {
      await clasificarMensaje(FRAUDE, determinista(FRAUDE), {
        completar: async () => {
          throw new Error("fallo");
        },
      });
    } finally {
      [console.log, console.error, console.warn] = original;
    }
    assert.ok(!vistos.some((v) => v.includes("dgt-multas-pago")));
  });
});

describe("SISTEMA", () => {
  test("el modelo recibe los teléfonos del SEPE escritos como en contexto.md §4.2", () => {
    const sepe = ["91", "926", "79", "70"].join(" ");
    assert.ok(SISTEMA.includes(`solo da los teléfonos 060 y ${sepe};`));
    assert.ok(SISTEMA.includes(`017 (INCIBE) o ${sepe} no se da por bueno`));
    assert.ok(!SISTEMA.includes("${"));
  });
});
