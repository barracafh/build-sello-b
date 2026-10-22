import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { motivoDescarte } from "./barrido";
import type { Ejecucion } from "./eval-lib";

const ej = (reserva: boolean, clasificado = true): Ejecucion => ({
  id: "x", repeticion: 1, esperado: "no_oficial", obtenido: "no_determinable", pasa: false,
  latencia_ms: 1, tokens: reserva ? null : 100, clasificado, reserva, motivo: null,
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
  });
});
