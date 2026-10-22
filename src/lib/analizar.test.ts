import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { analizar, esSoloUrl } from "./analizar";
import ejemplos from "../../datos/mensajes-ejemplo.json";

const sinRed = async () => {
  throw new Error("no debería llamarse");
};

describe("esSoloUrl", () => {
  test("un enlace solo, con o sin esquema, neutralizado o con punto final", () => {
    assert.ok(esSoloUrl("https://sede.dgt.gob.es/es/multas/"));
    assert.ok(esSoloUrl("  hxxps://dgt-multas-pago[.]com/x  "));
    assert.ok(esSoloUrl("www.correos.es."));
  });
  test("un mensaje con texto no lo es", () => {
    assert.ok(!esSoloUrl("DGT: pague aquí https://dgt-multas.top/x"));
    assert.ok(!esSoloUrl("Tiene un aviso pendiente"));
  });
});

describe("analizar", () => {
  test("solo una URL: no llama al modelo", async () => {
    const r = await analizar("https://sede.dgt.gob.es/es/multas/", { completar: sinRed });
    assert.equal(r.veredicto, "oficial_verificado");
    assert.equal(r.clasificado, false);
  });

  test("un mensaje llama al modelo una vez", async () => {
    let llamadas = 0;
    const r = await analizar(ejemplos[5].texto, {
      completar: async () => {
        llamadas++;
        return JSON.stringify({
          veredicto: "oficial_verificado",
          motivo: "Aviso informativo.",
          señales: [],
          entidad_suplantada: null,
          web_oficial: null,
        });
      },
    });
    assert.equal(llamadas, 1);
    assert.equal(r.veredicto, "no_determinable");
    assert.equal(r.motivo, "Aviso informativo.");
  });

  test("con el modelo caído, un fraude determinista sigue siendo no_oficial", async () => {
    const r = await analizar(
      "DGT: pague su multa en 24 horas hxxps://dgt-multas-pago[.]com/x",
      { completar: sinRed },
    );
    assert.equal(r.veredicto, "no_oficial");
  });
});
