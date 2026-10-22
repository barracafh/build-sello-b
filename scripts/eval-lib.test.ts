import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  CASOS,
  RAIZ,
  RUTA_DEV,
  calcularMetricas,
  ejecutarEvals,
  ejecutarHoldout,
  leerArgumentosEval,
  rutaConjuntoPermitida,
  type Ejecucion,
} from "./eval-lib";
import type { Analisis } from "../src/lib/analizar";

const ejec = (id: string, esperado: Ejecucion["esperado"], obtenido: Ejecucion["obtenido"]): Ejecucion => ({
  id, repeticion: 1, esperado, obtenido, pasa: esperado === obtenido,
  latencia_ms: 1, tokens: null, clasificado: true, reserva: false, motivo: null,
});

const ejemplos = CASOS.filter((c) => c.fuente.startsWith("repo:mensajes-ejemplo:"));

describe("conjunto", () => {
  test("usa el dev de LAB-47, con los 10 mensajes de ejemplo", () => {
    assert.equal(CASOS.length, 35);
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

describe("rutaConjuntoPermitida", () => {
  test("acepta dev.json, relativo a la raíz o absoluto", () => {
    assert.equal(rutaConjuntoPermitida(RUTA_DEV), true);
    assert.equal(rutaConjuntoPermitida(resolve(RAIZ, RUTA_DEV)), true);
  });

  test("rechaza rutas fuera de src/datos/evals/", () => {
    for (const ruta of [
      "~/sello-b-evals-holdout/test.json",
      "/tmp/conjunto.json",
      "datos/mensajes-ejemplo.json",
      "src/datos/evals/../../../datos/mensajes-ejemplo.json",
      "src/datos/evals",
      "src/datos/evals-holdout/dev.json",
    ]) {
      assert.equal(rutaConjuntoPermitida(ruta), false, ruta);
    }
  });

  test("rechaza cualquier test*.json, también dentro de src/datos/evals/", () => {
    for (const ruta of [
      "src/datos/evals/test.json",
      "src/datos/evals/test-2.json",
      "src/datos/evals/TEST.json",
      "src/datos/evals/sub/testing.json",
    ]) {
      assert.equal(rutaConjuntoPermitida(ruta), false, ruta);
    }
  });

  test("rechaza lo que no es .json", () => {
    assert.equal(rutaConjuntoPermitida("src/datos/evals/dev.ts"), false);
  });

  test("sigue los enlaces simbólicos: uno en evals/ que apunta fuera no vale", () => {
    const fuera = mkdtempSync(join(tmpdir(), "sello-eval-"));
    const enlace = resolve(RAIZ, "src/datos/evals/enlace-prueba.json");
    try {
      writeFileSync(join(fuera, "otro.json"), "[]");
      symlinkSync(join(fuera, "otro.json"), enlace);
      assert.equal(rutaConjuntoPermitida(enlace), false);
    } finally {
      rmSync(enlace, { force: true });
      rmSync(fuera, { recursive: true, force: true });
    }
  });
});

describe("leerArgumentosEval", () => {
  test("solo admite --modelo y --repeticiones: no hay forma de pasarle otro conjunto", () => {
    assert.deepEqual(leerArgumentosEval(["--modelo", "m", "--repeticiones", "3"]), {
      modelo: "m",
      repeticiones: 3,
    });
    assert.deepEqual(leerArgumentosEval([]), { modelo: undefined, repeticiones: 1 });
    for (const argv of [
      ["--conjunto", "/tmp/test.json"],
      ["--modelo", "m", "~/sello-b-evals-holdout/test.json"],
      ["--repeticiones", "0"],
      ["--modelo"],
    ]) {
      assert.throws(() => leerArgumentosEval(argv), Error, argv.join(" "));
    }
  });
});

describe("ejecutarHoldout", () => {
  test("imprime solo agregados: ni ids ni textos ni lista de fallos", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sello-holdout-"));
    const ruta = join(dir, "test.json");
    const casos = [
      { id: "secreto-01", texto: "TEXTO-SECRETO-UNO pague aquí", esperado: "no_oficial" },
      { id: "secreto-02", texto: "TEXTO-SECRETO-DOS hola", esperado: "no_determinable" },
      { id: "secreto-03", texto: "TEXTO-SECRETO-TRES remite[@]ejemplo.test", esperado: "no_oficial" },
    ];
    writeFileSync(ruta, JSON.stringify(casos));
    const vistos: string[] = [];
    const falso = async (texto: string): Promise<Analisis> => {
      vistos.push(texto);
      return {
        veredicto: texto.includes("UNO") ? "no_oficial" : "no_determinable",
        motivos: [], senales: [], clasificado: true, motivo: `motivo de ${texto}`,
      } as unknown as Analisis;
    };
    const consola: string[] = [];
    const originales = { log: console.log, error: console.error, warn: console.warn };
    console.log = console.error = console.warn = (...a: unknown[]) => void consola.push(a.join(" "));
    try {
      const salida = await ejecutarHoldout({ ruta, modelo: "m", analizar: falso, pausaMs: 0 });
      const todo = [salida, ...consola].join("\n");
      for (const c of casos) {
        assert.ok(!todo.includes(c.id), c.id);
        assert.ok(!todo.includes("SECRETO"), "texto");
      }
      assert.match(salida, /Accuracy: 66\.7 % \(2\/3\)/);
      assert.match(salida, /Falsos oficial_verificado: 0/);
      assert.match(salida, /no_oficial\s+precisión 100\.0 %\s+recall 50\.0 %/);
      assert.match(salida, /Reservas: 0/);
      // El clasificador ve la arroba real, como en dev.
      assert.ok(vistos.some((t) => t.includes("remite@ejemplo.test")));
    } finally {
      Object.assign(console, originales);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rechaza un archivo que no es una lista de casos", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sello-holdout-"));
    mkdirSync(join(dir, "x"));
    writeFileSync(join(dir, "malo.json"), JSON.stringify([{ id: "a", texto: "b", esperado: "otro" }]));
    try {
      await assert.rejects(ejecutarHoldout({ ruta: join(dir, "malo.json"), modelo: "m", pausaMs: 0 }));
      await assert.rejects(ejecutarHoldout({ ruta: join(dir, "x"), modelo: "m", pausaMs: 0 }));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
