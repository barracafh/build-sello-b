// Evals del clasificador: `bun run eval [--modelo <id>] [--repeticiones 3]`.
// Llama a la API real de HelmCode (necesita HELMCODE_API_KEY), de uno en uno.
// Escribe evals/resultados/<fecha>-<modelo>.json (ignorado por git) y evals/ULTIMO.md.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { informeCompleto, resumenMarkdown, tablaTexto } from "./eval-lib";

const argumento = (nombre: string) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

function configurado(): string | undefined {
  try {
    return (JSON.parse(readFileSync("evals/config.json", "utf8")) as { modelo?: string }).modelo;
  } catch {
    return undefined;
  }
}

const repeticiones = Number(argumento("repeticiones") ?? 1);
if (!Number.isInteger(repeticiones) || repeticiones < 1) {
  console.error("--repeticiones debe ser un entero ≥ 1");
  process.exit(2);
}

const informe = await informeCompleto({
  flag: argumento("modelo"),
  config: configurado(),
  repeticiones,
  alCaso: (e) => console.error(`${e.id}: ${e.obtenido} (${e.pasa ? "ok" : "NO"})`),
}).catch((e: Error) => {
  console.error(`No se pudo ejecutar el eval: ${e.message}`);
  process.exit(1);
});

console.log(tablaTexto(informe.ejecuciones));
const m = informe.metricas;
console.log(`\nModelo: ${informe.modelo}`);
console.log(`Accuracy: ${(m.accuracy * 100).toFixed(1)} % (${m.aciertos}/${m.total})`);
console.log(`Falsos oficial_verificado: ${m.falsos_oficial_verificado}`);
console.log(`no_oficial → no_determinable: ${m.no_oficial_a_no_determinable}`);
console.log(`Ejemplos oficiales: ${m.ejemplos_oficiales.aciertos}/${m.ejemplos_oficiales.total}`);
console.log(`Matriz (esperado → obtenido): ${JSON.stringify(m.matriz)}`);
console.log(`Puertas: ${m.gates.todos ? "TODAS OK" : JSON.stringify(m.gates)}`);

mkdirSync("evals/resultados", { recursive: true });
const nombre = `${informe.fecha.slice(0, 10)}-${informe.modelo.replace(/[^\w.-]/g, "_")}`;
writeFileSync(`evals/resultados/${nombre}.json`, JSON.stringify(informe, null, 2));
writeFileSync("evals/ULTIMO.md", resumenMarkdown([informe]));
console.log(`\nInforme: evals/resultados/${nombre}.json`);
