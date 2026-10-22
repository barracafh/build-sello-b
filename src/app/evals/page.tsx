import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import casos from "@/datos/evals/casos.json";

// Estática: lee public/evals.json al construir. Lo escribe scripts/eval-build.ts
// solo en un preview con `[eval]` en el commit. Sin el archivo, muestra el estado.
export const dynamic = "force-static";
export const metadata: Metadata = { title: "Evaluación del clasificador" };

type Ejecucion = {
  id: string;
  repeticion: number;
  esperado: string;
  obtenido: string;
  pasa: boolean;
  latencia_ms: number;
  tokens: number | null;
  reserva: boolean;
};
type Metricas = {
  total: number;
  aciertos: number;
  accuracy: number;
  por_clase: Record<string, { precision: number | null; recall: number | null; soporte: number }>;
  matriz: Record<string, Record<string, number>>;
  falsos_oficial_verificado: number;
  no_oficial_a_no_determinable: number;
  ejemplos_oficiales: { aciertos: number; total: number };
  casos_inestables: string[];
  reservas: number;
  gates: { sin_falsos_oficial: boolean; ejemplos_10_de_10: boolean; accuracy_85: boolean; todos: boolean };
};
type Informe =
  | { estado: "ok"; modelo: string; modelo_solicitado: string; modelos_disponibles: string[]; fecha: string; commit: string | null; repeticiones: number; casos: number; ejecuciones: Ejecucion[]; metricas: Metricas }
  | { estado: "sin_clave" | "error"; mensaje: string; fecha: string; commit: string | null }
  | { estado: "sin_evaluacion" };

function leer(): Informe {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "public/evals.json"), "utf8")) as Informe;
  } catch {
    return { estado: "sin_evaluacion" };
  }
}

const pct = (n: number | null) => (n === null ? "—" : `${(n * 100).toFixed(1)} %`);
const info = Object.fromEntries(casos.map((c) => [c.id, c]));
const CLASES = ["oficial_verificado", "no_oficial", "no_determinable"];

function Puerta({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Badge variant={ok ? "secondary" : "destructive"}>{ok ? "Cumple" : "No cumple"}</Badge>
      <span className="min-w-0 flex-[1_1_220px]">{texto}</span>
    </li>
  );
}

export default function Evals() {
  const informe = leer();
  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto max-w-[760px] px-(--page-gutter) pt-12 pb-20 outline-none md:pt-20"
    >
      <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
        Evaluación
      </p>
      <h1 className="mt-4 font-heading text-[clamp(32px,4.5vw,52px)] leading-[1.1] tracking-[-0.02em]">
        Cómo de bien clasifica el modelo
      </h1>

      {informe.estado === "sin_evaluacion" && (
        <p className="mt-6 text-lg text-(--text-secondary)">sin evaluación en este despliegue</p>
      )}
      {(informe.estado === "sin_clave" || informe.estado === "error") && (
        <Card render={<section />} className="mt-8 gap-2 px-6 py-6 text-base">
          <h2 className="font-sans text-lg leading-[1.35] font-medium">
            {informe.estado === "sin_clave" ? "Sin clave" : "El eval ha fallado"}
          </h2>
          <p className="[overflow-wrap:anywhere]">{informe.mensaje}</p>
          <p className="font-mono text-sm text-(--text-secondary)">
            {informe.fecha} · {informe.commit?.slice(0, 7) ?? "sin commit"}
          </p>
        </Card>
      )}
      {informe.estado === "ok" && <Resultado informe={informe} />}
    </main>
  );
}

function Resultado({ informe }: { informe: Extract<Informe, { estado: "ok" }> }) {
  const m = informe.metricas;
  return (
    <div className="mt-8 text-base [&>*+*]:mt-10">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
        <dt className="text-(--text-secondary)">Modelo</dt>
        <dd className="font-mono [overflow-wrap:anywhere]">{informe.modelo}</dd>
        <dt className="text-(--text-secondary)">Pedido</dt>
        <dd className="font-mono">{informe.modelo_solicitado}</dd>
        <dt className="text-(--text-secondary)">Fecha</dt>
        <dd className="font-mono [overflow-wrap:anywhere]">{informe.fecha}</dd>
        <dt className="text-(--text-secondary)">Commit</dt>
        <dd className="font-mono">{informe.commit?.slice(0, 7) ?? "local"}</dd>
        <dt className="text-(--text-secondary)">Casos</dt>
        <dd className="font-mono">{informe.casos} × {informe.repeticiones}</dd>
      </dl>

      <section aria-labelledby="puertas">
        <h2 id="puertas" className="font-sans text-lg leading-[1.35] font-medium">Puertas</h2>
        <ul className="mt-3 grid gap-3">
          <Puerta ok={m.gates.sin_falsos_oficial} texto={`${m.falsos_oficial_verificado} falsos «oficial_verificado» (debe ser 0)`} />
          <Puerta ok={m.gates.ejemplos_10_de_10} texto={`${m.ejemplos_oficiales.aciertos}/${m.ejemplos_oficiales.total} ejemplos de la organización (deben ser todos)`} />
          <Puerta ok={m.gates.accuracy_85} texto={`Acierto global ${pct(m.accuracy)} (${m.aciertos}/${m.total}; mínimo 85 %)`} />
        </ul>
      </section>

      <section aria-labelledby="metricas">
        <h2 id="metricas" className="font-sans text-lg leading-[1.35] font-medium">Métricas por clase</h2>
        <ul className="mt-3 grid gap-3">
          {CLASES.map((c) => (
            <li key={c}>
              <span className="font-mono [overflow-wrap:anywhere]">{c}</span>
              <span className="block text-(--text-secondary)">
                precisión {pct(m.por_clase[c].precision)} · recall {pct(m.por_clase[c].recall)} · {m.por_clase[c].soporte} casos
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-(--text-secondary)">
          «no_oficial» clasificado como «no_determinable»: {m.no_oficial_a_no_determinable}. Respuestas de reserva: {m.reservas}.
          {m.casos_inestables.length > 0 && ` Casos inestables: ${m.casos_inestables.join(", ")}.`}
        </p>
      </section>

      <section aria-labelledby="matriz">
        <h2 id="matriz" className="font-sans text-lg leading-[1.35] font-medium">Matriz de confusión</h2>
        <ul className="mt-3 grid gap-3">
          {CLASES.map((e) => (
            <li key={e}>
              <span className="font-mono [overflow-wrap:anywhere]">esperado {e}</span>
              <span className="block font-mono text-sm text-(--text-secondary)">
                {CLASES.map((o) => `${o}: ${m.matriz[e][o]}`).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="casos">
        <h2 id="casos" className="font-sans text-lg leading-[1.35] font-medium">Casos</h2>
        <ul className="mt-3 divide-y overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {informe.ejecuciones.map((e) => (
            <li key={`${e.id}-${e.repeticion}`} className="grid gap-1 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge variant={e.pasa ? "secondary" : "destructive"}>{e.pasa ? "Pasa" : "Falla"}</Badge>
                <span className="font-mono">{e.id}{e.repeticion > 1 ? `#${e.repeticion}` : ""}</span>
                <span className="font-mono text-sm text-(--text-secondary)">
                  {e.latencia_ms} ms · {e.tokens ?? "—"} tokens
                </span>
              </div>
              <p className="font-mono text-sm [overflow-wrap:anywhere]">
                esperado {e.esperado} · obtenido {e.obtenido}
              </p>
              <p className="text-sm text-(--text-secondary)">
                {info[e.id]?.motivo_esperado} ({info[e.id]?.fuente})
              </p>
            </li>
          ))}
        </ul>
      </section>

      <details className="text-sm text-(--text-secondary)">
        <summary className="cursor-pointer py-2">Modelos disponibles en HelmCode ({informe.modelos_disponibles.length})</summary>
        <p className="font-mono [overflow-wrap:anywhere]">{informe.modelos_disponibles.join(", ")}</p>
      </details>
    </div>
  );
}
