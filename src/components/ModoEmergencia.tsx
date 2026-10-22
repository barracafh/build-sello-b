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
import { diccionario, type Diccionario, type Idioma } from "@/i18n";

type Textos = Diccionario["emergencia"];

export function ModoEmergencia({ idioma = "es" }: { idioma?: Idioma }) {
  const t = diccionario(idioma).emergencia;
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
          <p className="font-semibold text-foreground">{t.yaHasActuado}</p>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t.cuentanos}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setAbierto(true)}
          className="shrink-0"
        >
          {t.yaHePulsado}
        </Button>
      </div>
    );
  }

  const pasos = seleccion.size > 0 ? pasosParaAcciones([...seleccion] as AccionId[]) : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t.queHiciste}</h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t.marca}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSeleccion(new Set()); setAbierto(false); }}
          className="shrink-0"
        >
          {t.cerrar}
        </Button>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="group" aria-label={t.accionesAria}>
        {ACCIONES.map((id) => {
          const activo = seleccion.has(id);
          return (
            <li key={id}>
              <button /* tema-ok: toggle de selección múltiple, no hay componente UI equivalente con aria-pressed */
                type="button"
                onClick={() => toggleAccion(id)}
                aria-pressed={activo}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  activo
                    ? "border-brand bg-brand/5"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="block font-medium text-foreground">{t.acciones[id].label}</span>
                <span className="block text-sm text-(--text-secondary)">{t.acciones[id].descripcion}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {pasos.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground">{t.pasosTitulo}</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {pasos.map((paso, i) => (
              <PasoItem key={paso.id} paso={paso} numero={i + 1} t={t} />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function PasoItem({ paso, numero, t }: { paso: Paso; numero: number; t: Textos }) {
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
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{t.pasos[paso.id]}</span>
          {paso.urgente && (
            <Badge variant="destructive" className="text-xs">
              {t.ahora}
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
                  // Las direcciones largas (incibe.es/…) se parten: sin scroll a 320 px.
                  className="inline-flex items-center gap-1 font-mono text-xs [overflow-wrap:anywhere] text-(--azul-importass) underline underline-offset-2 hover:text-(--azul-importass-oscuro) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--azul-importass-oscuro)"
                >
                  {enlace.texto}
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
