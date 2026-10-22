// Evals del clasificador: `bun run eval [--modelo <id>] [--repeticiones 3] [--idioma eu] [--timeout-ms 30000]`.
// Llama a la API real de HelmCode (necesita HELMCODE_API_KEY), de uno en uno y
// con 1 s de pausa. Sin `--modelo`: HELMCODE_MODEL_CLASIFICADOR o deepseek-v4-flash.
// Escribe evals/resultados/<fecha>-<modelo>.json (ignorado por git) y evals/ULTIMO.md.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { IDIOMA_POR_DEFECTO, IDIOMAS, esIdioma } from "../src/i18n";
import { informeCompleto, resumenMarkdown, tablaTexto, type Informe } from "./eval-lib";

const argumento = (nombre: string) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const repeticiones = Number(argumento("repeticiones") ?? 1);
if (!Number.isInteger(repeticiones) || repeticiones < 1) {
  console.error("--repeticiones debe ser un entero ≥ 1");
  process.exit(2);
}

// --idioma pide el `motivo` en ese idioma; los veredictos deben salir iguales.
const idioma = argumento("idioma") ?? IDIOMA_POR_DEFECTO;
if (!esIdioma(idioma)) {
  console.error(`--idioma debe ser uno de: ${IDIOMAS.join(", ")}`);
  process.exit(2);
}

// --timeout-ms sube el tiempo límite para medir la latencia real (LAB-73). Esas
// pasadas no miden lo que se publica: no entran en ULTIMO.md.
const timeoutMs = argumento("timeout-ms") === undefined ? undefined : Number(argumento("timeout-ms"));
if (timeoutMs !== undefined && !(Number.isInteger(timeoutMs) && timeoutMs > 0)) {
  console.error("--timeout-ms debe ser un entero > 0");
  process.exit(2);
}

const informe = await informeCompleto({
  modelo: argumento("modelo"),
  idioma,
  repeticiones,
  timeoutMs,
  alCaso: (e) => console.error(`${e.id}: ${e.obtenido} (${e.pasa ? "ok" : "NO"})`),
}).catch((e: Error) => {
  console.error(`No se pudo ejecutar el eval: ${e.message}`);
  process.exit(1);
});

console.log(tablaTexto(informe.ejecuciones));
const m = informe.metricas;
console.log(`\nModelo: ${informe.modelo}`);
console.log(`Idioma del motivo: ${idioma}`);
console.log(`Accuracy: ${(m.accuracy * 100).toFixed(1)} % (${m.aciertos}/${m.total})`);
console.log(`Falsos oficial_verificado: ${m.falsos_oficial_verificado}`);
console.log(`no_oficial → no_determinable: ${m.no_oficial_a_no_determinable}`);
console.log(`Ejemplos oficiales: ${m.ejemplos_oficiales.aciertos}/${m.ejemplos_oficiales.total}`);
console.log(`Matriz (esperado → obtenido): ${JSON.stringify(m.matriz)}`);
console.log(`Puertas: ${m.gates.todos ? "TODAS OK" : JSON.stringify(m.gates)}`);

mkdirSync("evals/resultados", { recursive: true });
const nombre = `${informe.fecha.slice(0, 19).replace(/:/g, "")}-${informe.modelo.replace(/[^\w.-]/g, "_")}${idioma === "es" ? "" : `-${idioma}`}${timeoutMs ? `-t${timeoutMs}` : ""}`;
writeFileSync(`evals/resultados/${nombre}.json`, JSON.stringify(informe, null, 2));
// ULTIMO.md lleva el último informe de cada modelo, para compararlos.
const ultimos = new Map<string, Informe>();
for (const archivo of readdirSync("evals/resultados").filter((a) => a.endsWith(".json"))) {
  const i = JSON.parse(readFileSync(`evals/resultados/${archivo}`, "utf8")) as Informe;
  // ULTIMO.md compara modelos en castellano: las pasadas en otro idioma no cuentan.
  if (!i.conjunto || !i.metricas || (i.idioma && i.idioma !== "es") || i.timeout_ms) continue;
  const previo = ultimos.get(i.modelo);
  if (!previo || previo.fecha < i.fecha) ultimos.set(i.modelo, i);
}
ultimos.delete(informe.modelo);
if (idioma === "es" && !timeoutMs) writeFileSync("evals/ULTIMO.md", resumenMarkdown([informe, ...ultimos.values()]));
console.log(`\nInforme: evals/resultados/${nombre}.json`);
