import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CASOS, calcularMetricas, ejecutarEvals, type Ejecucion } from "./eval-lib";
import type { Analisis } from "../src/lib/analizar";

const ejec = (id: string, esperado: Ejecucion["esperado"], obtenido: Ejecucion["obtenido"]): Ejecucion => ({
  id, repeticion: 1, esperado, obtenido, pasa: esperado === obtenido,
  latencia_ms: 1, tokens: null, clasificado: true, reserva: false, motivo: null,
});

const ejemplos = CASOS.filter((c) => c.fuente.startsWith("repo:mensajes-ejemplo:"));

describe("conjunto", () => {
  test("usa el dev de LAB-47, con los 10 mensajes de ejemplo", () => {
    assert.equal(CASOS.length, 41);
    assert.equal(ejemplos.length, 10);
  });
});

describe("calcularMetricas", () => {
  test("cuenta falsos oficial_verificado y no_oficial → no_determinable", () => {
    const m = calcularMetricas([
      ejec(ejemplos[0].id, "no_oficial", "no_determinable"),
      ejec("x-1", "no_determinable", "oficial_verificado"),
      ejec("x-2", "oficial_verificado", "oficial_verificado"),
      ejec("x-3", "no_oficial", "no_oficial"),
    ]);
    assert.equal(m.falsos_oficial_verificado, 1);
    assert.equal(m.no_oficial_a_no_determinable, 1);
    assert.equal(m.accuracy, 0.5);
    assert.equal(m.matriz.no_oficial.no_determinable, 1);
    assert.equal(m.por_clase.no_oficial.recall, 0.5);
    assert.equal(m.por_clase.oficial_verificado.precision, 0.5);
    assert.deepEqual(m.ejemplos_oficiales, { aciertos: 0, total: 1 });
    assert.equal(m.gates.todos, false);
  });

  test("las puertas se cumplen con 0 falsos oficiales, 10/10 y ≥ 85 %", () => {
    const m = calcularMetricas(ejemplos.map((c) => ejec(c.id, c.esperado, c.esperado)));
    assert.equal(m.gates.todos, true);
    assert.deepEqual(m.ejemplos_oficiales, { aciertos: 10, total: 10 });
  });

  test("detecta casos inestables entre repeticiones", () => {
    const m = calcularMetricas([
      ejec("x-1", "no_oficial", "no_oficial"),
      { ...ejec("x-1", "no_oficial", "no_determinable"), repeticion: 2 },
    ]);
    assert.deepEqual(m.casos_inestables, ["x-1"]);
  });
});

describe("ejecutarEvals", () => {
  test("de uno en uno, con pausa entre casos y sin solaparse", async () => {
    let activos = 0;
    let maximo = 0;
    const inicios: number[] = [];
    const falso = async (): Promise<Analisis> => {
      activos++;
      maximo = Math.max(maximo, activos);
      inicios.push(Date.now());
      await new Promise((r) => setTimeout(r, 5));
      activos--;
      return {
        veredicto: "no_determinable", motivos: [], url_analizada: null,
        senales: [], clasificado: true, motivo: "m",
      } as unknown as Analisis;
    };
    const r = await ejecutarEvals({
      modelo: "m",
      casos: CASOS.slice(0, 3),
      repeticiones: 2,
      pausaMs: 30,
      analizar: falso,
    });
    assert.equal(r.length, 6);
    assert.equal(maximo, 1);
    for (let i = 1; i < inicios.length; i++) assert.ok(inicios[i] - inicios[i - 1] >= 30);
    assert.deepEqual(r.map((e) => e.repeticion), [1, 1, 1, 2, 2, 2]);
  });
});
