// Hook de `prebuild`: ejecuta el eval solo en un despliegue de preview cuyo commit
// lleva `[eval]`, y escribe el informe en public/evals.json (git-ignorado), que
// sirve /evals. SIEMPRE sale con 0: un fallo del eval, la API caída o una clave
// ausente no pueden tumbar el despliegue.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const DEBE_EJECUTAR = (entorno: Record<string, string | undefined>) =>
  entorno.VERCEL_ENV === "preview" && (entorno.VERCEL_GIT_COMMIT_MESSAGE ?? "").includes("[eval]");

const SALIDA = "public/evals.json";

function escribir(contenido: unknown) {
  mkdirSync("public", { recursive: true });
  writeFileSync(SALIDA, JSON.stringify(contenido, null, 2));
}

async function principal() {
  if (!DEBE_EJECUTAR(process.env)) return;
  const fecha = new Date().toISOString();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  try {
    if (!process.env.HELMCODE_API_KEY) {
      escribir({ estado: "sin_clave", mensaje: "HELMCODE_API_KEY no disponible en preview", fecha, commit });
      return;
    }
    const { informeCompleto } = await import("./eval-lib");
    let config: string | undefined;
    try {
      config = (JSON.parse(readFileSync("evals/config.json", "utf8")) as { modelo?: string }).modelo;
    } catch {}
    const informe = await informeCompleto({ config, repeticiones: 1 });
    escribir({ estado: "ok", ...informe });
  } catch (e) {
    // El mensaje de error nunca lleva la clave: ia.ts no la incluye en ninguno.
    try {
      escribir({ estado: "error", mensaje: e instanceof Error ? e.message : "error desconocido", fecha, commit });
    } catch {}
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await principal().catch(() => {});
  process.exit(0);
}
