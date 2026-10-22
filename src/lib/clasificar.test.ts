import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  MOTIVO_NO_DISPONIBLE,
  TIMEOUT_MS,
  timeoutPara,
  clasificarMensaje,
  combinarClasificacion,
  esSalidaLlm,
  type SalidaLlm,
} from "./clasificar";
import { combinar, senales } from "./senales";
import { verificar } from "./verificar";
import type { Determinista } from "./clasificar-prompt";
import { es } from "@/i18n/es";

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

  test("sin salida del modelo, un oficial_verificado de la URL se mantiene", () => {
    const r = combinarClasificacion(null, determinista(OFICIAL));
    assert.equal(r.veredicto, "oficial_verificado");
    assert.equal(r.motivo, MOTIVO_NO_DISPONIBLE);
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
  test("acepta una señal con «fragmento», sin él o con null", () => {
    const señal = { codigo: "urgencia", evidencia: "e", fuente: "§1.4" };
    assert.ok(esSalidaLlm(llm({ señales: [{ ...señal, fragmento: "24 horas" }] })));
    assert.ok(esSalidaLlm(llm({ señales: [{ ...señal, fragmento: null }] })));
    assert.ok(esSalidaLlm(llm({ señales: [señal] })));
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

  // Solo cambia el idioma del motivo: ni SISTEMA ni el resto del mensaje.
  const mensajesCon = async (idioma?: "es" | "eu" | "va") => {
    let mensajes: { content: unknown }[] = [];
    await clasificarMensaje(FRAUDE, determinista(FRAUDE), {
      idioma,
      completar: async (m) => {
        mensajes = m;
        return JSON.stringify(llm());
      },
    });
    return mensajes.map((m) => String(m.content));
  };

  test("en castellano el mensaje no cambia", async () => {
    assert.deepEqual(await mensajesCon("es"), await mensajesCon());
  });

  test("en otro idioma añade una sola línea que pide el motivo en ese idioma", async () => {
    const [sistemaEs, usuarioEs] = await mensajesCon("es");
    const [sistemaEu, usuarioEu] = await mensajesCon("eu");
    assert.equal(sistemaEu, sistemaEs);
    assert.ok(usuarioEu.startsWith(usuarioEs));
    const extra = usuarioEu.slice(usuarioEs.length).trim();
    assert.equal(extra.split("\n").length, 1);
    assert.match(extra, /motivo/);
    assert.equal(extra, "Escribe «motivo» en euskera, en una sola frase breve.");
    assert.match((await mensajesCon("va"))[1], /valenciano/);
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

  test("devuelve las citas del modelo que están en el mensaje, con el color de su código", async () => {
    const señal = (codigo: string, fragmento: string) => ({ codigo, evidencia: "e", fuente: "§5.4", fragmento });
    const r = await clasificarMensaje(FRAUDE, determinista(FRAUDE), {
      completar: responde(
        JSON.stringify(
          llm({
            veredicto: "no_oficial",
            señales: [
              señal("pide_dinero", "PAGUE su multa"),
              señal("pide_datos", "introduzca su CVV"),
              señal("urgencia", "en 24 horas"),
            ],
          }),
        ),
      ),
    });
    assert.deepEqual(
      r.fragmentos.map((f) => [FRAUDE.slice(f.inicio, f.fin), f.nivel]),
      [["pague su multa", "roja"], ["en 24 horas", "naranja"]],
    );
    assert.ok(r.señales.every((s) => !("fragmento" in s)));
  });

  test("sin modelo no hay citas", async () => {
    const r = await clasificarMensaje(NEUTRO, det, { completar: responde("no es json") });
    assert.deepEqual(r.fragmentos, []);
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

// AnalizarMensaje reconoce este motivo de reserva para enseñarlo traducido.
test("el motivo de reserva de un no_oficial coincide con el del diccionario", () => {
  const det = determinista(FRAUDE);
  assert.equal(det.resultado.veredicto, "no_oficial");
  assert.equal(combinarClasificacion(null, det).motivo, es.analizar.motivoSuplantacion);
});

// Pedir el motivo en otro idioma alarga la respuesta (LAB-68): más margen solo ahí.
test("el timeout es de 8 s en castellano y de 12 s en los otros idiomas", () => {
  assert.equal(TIMEOUT_MS, 8000);
  assert.equal(timeoutPara(undefined), 8000);
  assert.equal(timeoutPara("es"), 8000);
  for (const idioma of ["ca", "va", "gl", "eu"] as const) assert.equal(timeoutPara(idioma), 12000);
});
