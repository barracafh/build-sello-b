import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { motivoDescarte, sinRespuesta } from "./barrido";
import type { Ejecucion } from "./eval-lib";

const ej = (reserva: boolean, clasificado = true): Ejecucion => ({
  id: "x", repeticion: 1, esperado: "no_oficial", obtenido: "no_determinable", pasa: false,
  latencia_ms: 1, tokens: reserva ? null : 100, clasificado, reserva, motivo: null,
});

describe("sinRespuesta", () => {
  test("una llamada sin tokens es reserva aunque las señales deterministas tapen el fallo", () => {
    // Con señales concluyentes, combinarClasificacion da no_oficial sin el modelo
    // y el motivo no es «clasificador no disponible».
    assert.equal(sinRespuesta({ ...ej(false), tokens: null, obtenido: "no_oficial", pasa: true }), true);
    assert.equal(sinRespuesta(ej(true)), true);
    assert.equal(sinRespuesta(ej(false)), false);
    assert.equal(sinRespuesta({ ...ej(false, false), tokens: null }), false);
  });
});

describe("motivoDescarte", () => {
  test("descarta si las 3 primeras llamadas al modelo no dan JSON válido", () => {
    assert.match(motivoDescarte([ej(true), ej(false, false), ej(true), ej(true)]) ?? "", /3 primeros/);
    assert.equal(motivoDescarte([ej(true), ej(true), ej(false)]), null);
    assert.equal(motivoDescarte([ej(true), ej(true)]), null);
  });

  test("descarta con 10 respuestas de reserva o más", () => {
    const diez = [ej(false), ...Array.from({ length: 10 }, () => ej(true))];
    assert.match(motivoDescarte(diez) ?? "", /10 reservas/);
    assert.equal(motivoDescarte(diez.slice(0, 10)), null);
    const tapadas = [ej(false), ...Array.from({ length: 10 }, () => ({ ...ej(false), tokens: null }))];
    assert.match(motivoDescarte(tapadas) ?? "", /10 reservas/);
  });
});
