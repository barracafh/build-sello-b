// Núcleo de `bun run eval`. Llama a `analizar()`, el mismo pipeline que
// POST /api/verificar, en proceso y de uno en uno, con una pausa entre casos: los
// límites de HelmCode son compartidos. Cuesta llamadas reales a la API: no forma
// parte de `test` ni de `build`.
import type { Idioma } from "../src/i18n";
import { execSync } from "node:child_process";
import { analizar } from "../src/lib/analizar";
import { modeloClasificador } from "../src/lib/clasificar";
import type { UsoIa } from "../src/lib/ia";
import dev from "../src/datos/evals/dev.json";

export const VEREDICTOS = ["oficial_verificado", "no_oficial", "no_determinable"] as const;
export type Veredicto = (typeof VEREDICTOS)[number];

// Conjunto dev de LAB-47 (src/datos/evals/README.md). El de prueba no está en el repo.
export type Caso = {
  id: string;
  texto: string;
  esperado: Veredicto;
  motivo_esperado: string;
  fuente: string;
  sintetico: boolean;
  canal: string;
  etiqueta_origen: string;
};

export type Ejecucion = {
  id: string;
  repeticion: number;
  esperado: Veredicto;
  obtenido: Veredicto;
  pasa: boolean;
  latencia_ms: number;
  tokens: number | null;
  // De `tokens`, los de la respuesta y, dentro de ellos, los de razonamiento (LAB-73).
  tokens_salida?: number | null;
  tokens_razonamiento?: number | null;
  clasificado: boolean;
  // El modelo no respondió y se usó la reserva.
  reserva: boolean;
  motivo: string | null;
};

export type Metricas = {
  total: number;
  aciertos: number;
  accuracy: number;
  por_clase: Record<Veredicto, { precision: number | null; recall: number | null; soporte: number }>;
  // matriz[esperado][obtenido]
  matriz: Record<Veredicto, Record<Veredicto, number>>;
  falsos_oficial_verificado: number;
  no_oficial_a_no_determinable: number;
  ejemplos_oficiales: { aciertos: number; total: number };
  casos_inestables: string[];
  reservas: number;
  gates: {
    sin_falsos_oficial: boolean;
    ejemplos_10_de_10: boolean;
    accuracy_85: boolean;
    todos: boolean;
  };
};

export type Informe = {
  modelo: string;
  /** Idioma del `motivo` (LAB-68); sin él, castellano. */
  idioma?: Idioma;
  /** Tiempo límite forzado con --timeout-ms; sin él, el del clasificador. */
  timeout_ms?: number;
  conjunto: string;
  fecha: string;
  commit: string | null;
  repeticiones: number;
  casos: number;
  ejecuciones: Ejecucion[];
  metricas: Metricas;
};

export const CASOS = dev as Caso[];
// Los 10 mensajes de datos/mensajes-ejemplo.json, por su fuente.
const EJEMPLOS = new Set(
  CASOS.filter((c) => c.fuente.startsWith("repo:mensajes-ejemplo:")).map((c) => c.id),
);
const ES_EJEMPLO_OFICIAL = (id: string) => EJEMPLOS.has(id);

const razon = (a: number, b: number) => (b === 0 ? null : a / b);

export function calcularMetricas(ejecuciones: Ejecucion[]): Metricas {
  const matriz = Object.fromEntries(
    VEREDICTOS.map((e) => [e, Object.fromEntries(VEREDICTOS.map((o) => [o, 0]))]),
  ) as Metricas["matriz"];
  for (const e of ejecuciones) matriz[e.esperado][e.obtenido]++;

  const por_clase = Object.fromEntries(
    VEREDICTOS.map((v) => {
      const tp = matriz[v][v];
      const predichos = VEREDICTOS.reduce((n, e) => n + matriz[e][v], 0);
      const reales = VEREDICTOS.reduce((n, o) => n + matriz[v][o], 0);
      return [v, { precision: razon(tp, predichos), recall: razon(tp, reales), soporte: reales }];
    }),
  ) as Metricas["por_clase"];

  const aciertos = ejecuciones.filter((e) => e.pasa).length;
  const accuracy = ejecuciones.length ? aciertos / ejecuciones.length : 0;
  const falsos = VEREDICTOS.filter((v) => v !== "oficial_verificado").reduce(
    (n, e) => n + matriz[e].oficial_verificado,
    0,
  );
  const ejemplos = ejecuciones.filter((e) => ES_EJEMPLO_OFICIAL(e.id));
  const ejemplosOk = ejemplos.filter((e) => e.pasa).length;

  const porCaso = new Map<string, Set<string>>();
  for (const e of ejecuciones) {
    porCaso.set(e.id, (porCaso.get(e.id) ?? new Set()).add(e.obtenido));
  }
  const gates = {
    sin_falsos_oficial: falsos === 0,
    ejemplos_10_de_10: ejemplos.length > 0 && ejemplosOk === ejemplos.length,
    accuracy_85: accuracy >= 0.85,
    todos: false,
  };
  gates.todos = gates.sin_falsos_oficial && gates.ejemplos_10_de_10 && gates.accuracy_85;

  return {
    total: ejecuciones.length,
    aciertos,
    accuracy,
    por_clase,
    matriz,
    falsos_oficial_verificado: falsos,
    no_oficial_a_no_determinable: matriz.no_oficial.no_determinable,
    ejemplos_oficiales: { aciertos: ejemplosOk, total: ejemplos.length },
    casos_inestables: [...porCaso].filter(([, s]) => s.size > 1).map(([id]) => id),
    reservas: ejecuciones.filter((e) => e.reserva).length,
    gates,
  };
}

const MOTIVO_RESERVA = "clasificador no disponible";

export const PAUSA_MS = 1000;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function ejecutarEvals(opciones: {
  modelo: string;
  idioma?: Idioma;
  repeticiones?: number;
  casos?: Caso[];
  pausaMs?: number;
  // Solo para diagnosticar latencias (LAB-73): sin él, el del clasificador.
  timeoutMs?: number;
  analizar?: typeof analizar;
  alCaso?: (e: Ejecucion) => void;
}): Promise<Ejecucion[]> {
  const salida: Ejecucion[] = [];
  const analizarCaso = opciones.analizar ?? analizar;
  for (let rep = 1; rep <= (opciones.repeticiones ?? 1); rep++) {
    for (const caso of opciones.casos ?? CASOS) {
      // Una llamada detrás de otra, con pausa: nunca en paralelo.
      if (salida.length > 0) await esperar(opciones.pausaMs ?? PAUSA_MS);
      let tokens: number | null = null;
      let tokensSalida: number | null = null;
      let tokensRazonamiento: number | null = null;
      const alUso = (u: UsoIa) => {
        tokens = (tokens ?? 0) + (u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0));
        if (u.completion_tokens !== undefined) tokensSalida = (tokensSalida ?? 0) + u.completion_tokens;
        const razonamiento = u.completion_tokens_details?.reasoning_tokens;
        if (razonamiento !== undefined) tokensRazonamiento = (tokensRazonamiento ?? 0) + razonamiento;
      };
      const inicio = performance.now();
      const r = await analizarCaso(caso.texto, {
        modelo: opciones.modelo,
        alUso,
        idioma: opciones.idioma,
        timeoutMs: opciones.timeoutMs,
      });
      const e: Ejecucion = {
        id: caso.id,
        repeticion: rep,
        esperado: caso.esperado,
        obtenido: r.veredicto,
        pasa: r.veredicto === caso.esperado,
        latencia_ms: Math.round(performance.now() - inicio),
        tokens,
        tokens_salida: tokensSalida,
        tokens_razonamiento: tokensRazonamiento,
        clasificado: r.clasificado,
        reserva: r.clasificado && r.motivo === MOTIVO_RESERVA,
        motivo: r.motivo ?? null,
      };
      salida.push(e);
      opciones.alCaso?.(e);
    }
  }
  return salida;
}

const commitLocal = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};

export async function informeCompleto(opciones: {
  modelo?: string;
  idioma?: Idioma;
  repeticiones?: number;
  timeoutMs?: number;
  alCaso?: (e: Ejecucion) => void;
}): Promise<Informe> {
  const modelo = opciones.modelo || modeloClasificador();
  const ejecuciones = await ejecutarEvals({
    modelo,
    idioma: opciones.idioma,
    repeticiones: opciones.repeticiones,
    timeoutMs: opciones.timeoutMs,
    alCaso: opciones.alCaso,
  });
  return {
    modelo,
    ...(opciones.idioma && opciones.idioma !== "es" ? { idioma: opciones.idioma } : {}),
    ...(opciones.timeoutMs ? { timeout_ms: opciones.timeoutMs } : {}),
    conjunto: "src/datos/evals/dev.json",
    fecha: new Date().toISOString(),
    commit: commitLocal(),
    repeticiones: opciones.repeticiones ?? 1,
    casos: CASOS.length,
    ejecuciones,
    metricas: calcularMetricas(ejecuciones),
  };
}

const pct = (n: number | null) => (n === null ? "—" : `${(n * 100).toFixed(1)} %`);

export function resumenMarkdown(informes: Informe[]): string {
  const filas = (i: Informe) => {
    const m = i.metricas;
    const clases = VEREDICTOS.map(
      (v) => `| ${v} | ${pct(m.por_clase[v].precision)} | ${pct(m.por_clase[v].recall)} | ${m.por_clase[v].soporte} |`,
    ).join("\n");
    const matriz = VEREDICTOS.map(
      (e) => `| ${e} | ${VEREDICTOS.map((o) => m.matriz[e][o]).join(" | ")} |`,
    ).join("\n");
    const si = (b: boolean) => (b ? "✅" : "❌");
    return `## ${i.modelo}

Fecha: ${i.fecha} · commit: ${i.commit ?? "—"} · conjunto: \`${i.conjunto}\` · casos: ${i.casos} × ${i.repeticiones}

- Accuracy: **${pct(m.accuracy)}** (${m.aciertos}/${m.total}) ${si(m.gates.accuracy_85)} (puerta: ≥ 85 %)
- Falsos \`oficial_verificado\`: **${m.falsos_oficial_verificado}** ${si(m.gates.sin_falsos_oficial)} (puerta: 0)
- Ejemplos de \`datos/mensajes-ejemplo.json\`: **${m.ejemplos_oficiales.aciertos}/${m.ejemplos_oficiales.total}** ${si(m.gates.ejemplos_10_de_10)} (puerta: 10/10)
- \`no_oficial\` → \`no_determinable\`: ${m.no_oficial_a_no_determinable}
- Respuestas de reserva (modelo no disponible): ${m.reservas}
- Casos inestables entre repeticiones: ${m.casos_inestables.join(", ") || "ninguno"}

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
${clases}

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden ${VEREDICTOS.join(" / ")}):

| esperado \\ obtenido | ${VEREDICTOS.join(" | ")} |
| --- | --- | --- | --- |
${matriz}
`;
  };
  return `# Último eval

Generado por \`bun run eval\` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: \`analizar()\` (verificar + señales + clasificador), el mismo que usa \`POST /api/verificar\`.

${informes.map(filas).join("\n")}`;
}

export function tablaTexto(ejecuciones: Ejecucion[]): string {
  const cab = ["id", "esperado", "obtenido", "ok", "ms", "tokens", "salida", "razon."];
  const filas = ejecuciones.map((e) => [
    `${e.id}${e.repeticion > 1 ? `#${e.repeticion}` : ""}`,
    e.esperado,
    e.obtenido,
    e.pasa ? "sí" : "NO",
    String(e.latencia_ms),
    e.tokens === null ? "—" : String(e.tokens),
    e.tokens_salida == null ? "—" : String(e.tokens_salida),
    e.tokens_razonamiento == null ? "—" : String(e.tokens_razonamiento),
  ]);
  const anchos = cab.map((c, i) => Math.max(c.length, ...filas.map((f) => f[i].length)));
  const linea = (f: string[]) => f.map((c, i) => c.padEnd(anchos[i])).join("  ");
  return [linea(cab), ...filas.map(linea)].join("\n");
}
