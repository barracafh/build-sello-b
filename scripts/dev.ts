// `bun run dev`: arranca next dev en un puerto propio de este worktree e
// imprime la URL con la ruta del equipo. PORT=<puerto> lo fija a mano.
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import ficha from "../ficha.json";
import { elegirPuerto } from "./puerto";

const raiz = resolve(import.meta.dirname, "..");
const puerto = await elegirPuerto(raiz);

console.log(`\n  sello · http://localhost:${puerto}/${ficha.equipo}\n`);

const next = spawn(resolve(raiz, "node_modules/.bin/next"), ["dev", "--port", String(puerto)], {
  cwd: raiz,
  stdio: "inherit",
  env: { ...process.env, PORT: String(puerto) },
});

for (const senal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(senal, () => next.kill(senal));
}
next.on("exit", (codigo, senal) => process.exit(codigo ?? (senal ? 1 : 0)));
