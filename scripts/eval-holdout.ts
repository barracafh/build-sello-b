// Mide el conjunto de prueba: `bun run eval:holdout <ruta> [--modelo <id>]`.
// Solo lo ejecuta el Verifier, una vez por PR y sobre el candidato final. Imprime
// solo métricas agregadas y no escribe nada: ni ids, ni textos, ni fallos.
import { ejecutarHoldout } from "./eval-lib";

const [ruta, ...resto] = process.argv.slice(2);
const i = resto.indexOf("--modelo");
const modelo = i >= 0 ? resto[i + 1] : undefined;
if (!ruta || ruta.startsWith("--") || (i >= 0 && !modelo) || resto.length !== (i >= 0 ? 2 : 0)) {
  console.error("Uso: bun run eval:holdout <ruta> [--modelo <id>]");
  process.exit(2);
}

try {
  console.log(await ejecutarHoldout({ ruta, modelo }));
} catch (e) {
  console.error(`No se pudo ejecutar el eval de prueba: ${(e as Error).message}`);
  process.exit(1);
}
