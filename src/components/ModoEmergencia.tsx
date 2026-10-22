"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACCIONES,
  pasosParaAcciones,
  type AccionId,
  type Paso,
} from "@/datos/pasos-emergencia";

export function ModoEmergencia() {
  const [abierto, setAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<Set<AccionId>>(new Set());

  function toggleAccion(id: AccionId) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!abierto) {
    return (
      <div className="border-l-4 border-brand rounded-r-xl bg-muted px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">¿Ya has actuado?</p>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Cuéntanos qué pasó y te decimos qué hacer ahora.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setAbierto(true)}
          className="shrink-0"
        >
          Ya he pulsado →
        </Button>
      </div>
    );
  }

  const pasos = seleccion.size > 0 ? pasosParaAcciones([...seleccion] as AccionId[]) : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">¿Qué hiciste?</h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Marca todo lo que corresponda. Los pasos aparecen al instante.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSeleccion(new Set()); setAbierto(false); }}
          className="shrink-0"
        >
          Cerrar
        </Button>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="group" aria-label="Acciones realizadas">
        {ACCIONES.map((accion) => {
          const activo = seleccion.has(accion.id);
          return (
            <li key={accion.id}>
              <button /* tema-ok: toggle de selección múltiple, no hay componente UI equivalente con aria-pressed */
                type="button"
                onClick={() => toggleAccion(accion.id)}
                aria-pressed={activo}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  activo
                    ? "border-brand bg-brand/5"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="block font-medium text-foreground">{accion.label}</span>
                <span className="block text-sm text-(--text-secondary)">{accion.descripcion}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {pasos.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground">Pasos para tu caso</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {pasos.map((paso, i) => (
              <PasoItem key={paso.id} paso={paso} numero={i + 1} />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function PasoItem({ paso, numero }: { paso: Paso; numero: number }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold",
          paso.urgente
            ? "bg-brand text-white" /* tema-ok: número de paso urgente sobre brand, acento funcional */
            : "bg-muted text-(--text-secondary)",
        )}
      >
        {numero}
      </span>
      <div className="flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{paso.texto}</span>
          {paso.urgente && (
            <Badge variant="destructive" className="text-xs">
              Ahora
            </Badge>
          )}
        </div>
        {paso.enlaces.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {paso.enlaces.map((enlace) => (
              <li key={enlace.url}>
                <a
                  href={enlace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-(--azul-importass) underline underline-offset-2 hover:text-(--azul-importass-oscuro) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--azul-importass-oscuro)"
                >
                  {enlace.texto}
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 font-mono text-xs text-(--text-secondary)">{paso.fuente}</p>
      </div>
    </li>
  );
}
