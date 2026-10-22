import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CASOS, calcularMetricas, resolverModelo, type Ejecucion } from "./eval-lib";
import { DEBE_EJECUTAR } from "./eval-build";

const ejec = (id: string, esperado: Ejecucion["esperado"], obtenido: Ejecucion["obtenido"]): Ejecucion => ({
  id, repeticion: 1, esperado, obtenido, pasa: esperado === obtenido,
  latencia_ms: 1, tokens: null, clasificado: true, reserva: false, motivo: null,
});

describe("dataset", () => {
  test("incluye los 10 ejemplos y al menos 20 sintéticos, con los campos pedidos", () => {
    assert.equal(CASOS.filter((c) => c.fuente === "datos/mensajes-ejemplo.json").length, 10);
    assert.ok(CASOS.filter((c) => c.sintetico).length >= 20);
    assert.equal(new Set(CASOS.map((c) => c.id)).size, CASOS.length);
    for (const c of CASOS) {
      assert.ok(c.texto && c.motivo_esperado && c.fuente);
      assert.ok(["oficial_verificado", "no_oficial", "no_determinable"].includes(c.esperado));
    }
  });
});

describe("calcularMetricas", () => {
  test("cuenta falsos oficial_verificado y no_oficial → no_determinable", () => {
    const m = calcularMetricas([
      ejec("F01", "no_oficial", "no_determinable"),
      ejec("S17", "no_determinable", "oficial_verificado"),
      ejec("L05", "oficial_verificado", "oficial_verificado"),
      ejec("S01", "no_oficial", "no_oficial"),
    ]);
    assert.equal(m.falsos_oficial_verificado, 1);
    assert.equal(m.no_oficial_a_no_determinable, 1);
    assert.equal(m.accuracy, 0.5);
    assert.equal(m.matriz.no_oficial.no_determinable, 1);
    assert.equal(m.por_clase.no_oficial.recall, 0.5);
    assert.equal(m.por_clase.oficial_verificado.precision, 0.5);
    assert.equal(m.gates.todos, false);
  });

  test("las puertas se cumplen con 0 falsos oficiales, 10/10 y ≥ 85 %", () => {
    const ids = ["F01", "F02", "F03", "F04", "F05", "L01", "L02", "L03", "L04"];
    const runs = [
      ...ids.map((id) => ejec(id, "no_determinable", "no_determinable")),
      ejec("L05", "oficial_verificado", "oficial_verificado"),
    ];
    assert.equal(calcularMetricas(runs).gates.todos, true);
  });

  test("detecta casos inestables entre repeticiones", () => {
    const m = calcularMetricas([
      ejec("S01", "no_oficial", "no_oficial"),
      { ...ejec("S01", "no_oficial", "no_determinable"), repeticion: 2 },
    ]);
    assert.deepEqual(m.casos_inestables, ["S01"]);
  });
});

describe("resolverModelo", () => {
  const modelos = ["glm5.3-flash", "deepseek-v4-flash", "deepseek-pro"];
  test("orden: flag, config, entorno", () => {
    assert.equal(resolverModelo({ flag: "a", config: "b", entorno: "c" }, modelos), "a");
    assert.equal(resolverModelo({ config: "b", entorno: "c" }, modelos), "b");
    assert.equal(resolverModelo({ entorno: "c" }, modelos), "c");
  });
  test("auto elige el primer deepseek…flash de /models", () => {
    assert.equal(resolverModelo({ config: "auto" }, modelos), "deepseek-v4-flash");
  });
  test("auto sin coincidencia falla", () => {
    assert.throws(() => resolverModelo({ config: "auto" }, ["glm5.3-flash"]));
  });
});

describe("eval-build", () => {
  test("solo se ejecuta en preview con [eval] en el mensaje del commit", () => {
    assert.equal(DEBE_EJECUTAR({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_MESSAGE: "feat: x [eval]" }), true);
    assert.equal(DEBE_EJECUTAR({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_MESSAGE: "[eval]" }), false);
    assert.equal(DEBE_EJECUTAR({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_MESSAGE: "feat: x" }), false);
    assert.equal(DEBE_EJECUTAR({}), false);
  });

  const lanzar = (entorno: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), "eval-build-"));
    const r = spawnSync("bun", [resolve("scripts/eval-build.ts")], {
      cwd: dir,
      env: { PATH: process.env.PATH ?? "", ...entorno } as unknown as NodeJS.ProcessEnv,
      encoding: "utf8",
    });
    return { r, salida: join(dir, "public/evals.json") };
  };

  test("fuera de preview no hace nada y sale con 0", () => {
    const { r, salida } = lanzar({});
    assert.equal(r.status, 0);
    assert.equal(existsSync(salida), false);
  });

  test("sin clave deja un informe «sin_clave» y sale con 0", () => {
    const { r, salida } = lanzar({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_MESSAGE: "[eval]" });
    assert.equal(r.status, 0);
    assert.equal(JSON.parse(readFileSync(salida, "utf8")).estado, "sin_clave");
  });

  test("con la API caída deja un informe «error» y sale con 0", () => {
    const { r, salida } = lanzar({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_MESSAGE: "[eval]",
      HELMCODE_API_KEY: "clave-de-prueba",
      HELMCODE_BASE_URL: "http://127.0.0.1:1",
    });
    assert.equal(r.status, 0);
    const informe = JSON.parse(readFileSync(salida, "utf8"));
    assert.equal(informe.estado, "error");
    assert.ok(!JSON.stringify(informe).includes("clave-de-prueba"));
  });
});
