// `bun run dev`: arranca next dev en un puerto propio de este worktree e
// imprime la URL con la ruta del equipo. PORT=<puerto> lo fija a mano.
// Con Tailscale, publica además un preview solo para la tailnet.
import { spawn } from "node:child_process";
import { connect } from "node:net";
import { resolve } from "node:path";
import ficha from "../ficha.json";
import { publicar, resolverBase, retirar, urlPreview } from "./preview";
import { elegirPuerto } from "./puerto";

const responde = (p: number) =>
  new Promise<boolean>((fin) => {
    const c = connect({ port: p, host: "127.0.0.1" });
    c.once("connect", () => (c.destroy(), fin(true)));
    c.once("error", () => fin(false));
  });

const raiz = resolve(import.meta.dirname, "..");
const puerto = await elegirPuerto(raiz);

console.log(`\n  sello · http://localhost:${puerto}/${ficha.equipo}`);

const base = resolverBase(process.env);
console.log("");

const next = spawn(resolve(raiz, "node_modules/.bin/next"), ["dev", "--port", String(puerto)], {
  cwd: raiz,
  stdio: "inherit",
  env: { ...process.env, PORT: String(puerto), ...(base ? { PREVIEW_BASE_URL: base } : {}) },
});

// tailscale serve ocupa el puerto: next tiene que estar escuchando antes de publicarlo.
async function publicarCuandoEscuche(base: string) {
  for (let i = 0; i < 240 && next.exitCode === null; i++) {
    if (await responde(puerto)) {
      if (publicar(puerto)) {
        console.log(`\n  Preview: ${urlPreview(base, puerto, ficha.equipo)}\n`);
      } else {
        console.warn("\n  Preview no disponible: tailscale serve falló; sigo sin preview.\n");
      }
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}
if (base) void publicarCuandoEscuche(base);

const salir = (codigo: number) => {
  retirar(puerto);
  process.exit(codigo);
};

for (const senal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(senal, () => {
    retirar(puerto);
    next.kill(senal);
  });
}
process.on("uncaughtException", (e) => {
  console.error(e);
  next.kill("SIGTERM");
  salir(1);
});
next.on("exit", (codigo, senal) => salir(codigo ?? (senal ? 1 : 0)));
