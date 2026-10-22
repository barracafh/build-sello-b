// Barrido de modelos sobre dev (LAB-49): `bun scripts/barrido.ts <id> [<id>…]`.
// Mismo pipeline que `bun run eval`, un modelo detrás de otro y un caso detrás de
// otro, con 1 s de pausa. Corta un modelo en cuanto queda descartado (sin JSON
// válido en sus 3 primeras llamadas o con ≥ 10 reservas), para no gastar
// llamadas de los límites compartidos. Guarda cada informe en evals/resultados/.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CASOS, RUTA_DEV, calcularMetricas, ejecutarEvals, type Ejecucion, type Informe } from "./eval-lib";

export const MAX_RESERVAS = 10;

// El modelo no respondió. `reserva` solo ve el motivo «clasificador no
// disponible», pero si las señales deterministas ya dan no_oficial,
// combinarClasificacion responde sin el modelo y con otro motivo. HelmCode
// informa de los tokens en toda respuesta: una llamada sin tokens no tuvo respuesta.
export const sinRespuesta = (e: Ejecucion) => e.clasificado && (e.reserva || e.tokens === null);

export function motivoDescarte(ejecuciones: Ejecucion[]): string | null {
  // Solo cuentan los casos que llegan al modelo (un texto que es solo un enlace no).
  const llamadas = ejecuciones.filter((e) => e.clasificado);
  if (llamadas.length >= 3 && llamadas.slice(0, 3).every(sinRespuesta))
    return "sin JSON válido en los 3 primeros casos";
  const reservas = llamadas.filter(sinRespuesta).length;
  if (reservas >= MAX_RESERVAS) return `${reservas} reservas (≥ ${MAX_RESERVAS})`;
  return null;
}

class Descartado extends Error {}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const modelos = process.argv.slice(2);
  const repeticiones = 1;
  mkdirSync("evals/resultados", { recursive: true });
  for (const modelo of modelos) {
    const ejecuciones: Ejecucion[] = [];
    let descarte: string | null = null;
    const fecha = new Date().toISOString();
    try {
      await ejecutarEvals({
        modelo,
        repeticiones,
        alCaso: (e) => {
          ejecuciones.push(e);
          descarte = motivoDescarte(ejecuciones);
          if (descarte) throw new Descartado(descarte);
        },
      });
    } catch (e) {
      if (!(e instanceof Descartado)) throw e;
    }
    const informe: Informe & { descarte: string | null } = {
      modelo,
      conjunto: RUTA_DEV,
      fecha,
      commit: null,
      repeticiones,
      casos: CASOS.length,
      ejecuciones,
      metricas: calcularMetricas(ejecuciones),
      descarte,
    };
    const nombre = `${fecha.slice(0, 19).replace(/:/g, "")}-barrido-${modelo.replace(/[^\w.-]/g, "_")}`;
    writeFileSync(`evals/resultados/${nombre}.json`, JSON.stringify(informe, null, 2));
    const m = informe.metricas;
    console.log(
      `${modelo}: ${descarte ? `DESCARTADO (${descarte}) tras ${ejecuciones.length} casos` : `${m.aciertos}/${m.total}, ${ejecuciones.filter(sinRespuesta).length} reservas, falsos oficiales ${m.falsos_oficial_verificado}`}`,
    );
  }
}
