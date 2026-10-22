"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/Fuentes";
import {
  ACCIONES,
  pasosParaAcciones,
  type AccionId,
  type Paso,
} from "@/datos/pasos-emergencia";

const ID_PASOS = "pasos-emergencia";

const FUENTES = [
  {
    nombre: "INCIBE · Línea de ayuda en ciberseguridad 017",
    url: "https://www.incibe.es/linea-de-ayuda-en-ciberseguridad",
  },
  {
    nombre: "INCIBE · Reporte de fraude",
    url: "https://www.incibe.es/ciudadania/ayuda/reporte-de-fraude",
  },
];

// En escritorio, acciones a la izquierda (fijas al hacer scroll) y pasos a la
// derecha. En móvil, una columna y un botón flotante que lleva a los pasos
// mientras no se ven.
export function ModoEmergencia() {
  const [abierto, setAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<Set<AccionId>>(new Set());
  const [pasosALaVista, setPasosALaVista] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const pasos = seleccion.size > 0 ? pasosParaAcciones([...seleccion]) : [];
  const urgentes = pasos.filter((p) => p.urgente);
  const despues = pasos.filter((p) => !p.urgente);

  useEffect(() => {
    const nodo = panel.current;
    if (!nodo || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(([e]) => setPasosALaVista(e.isIntersecting), {
      threshold: 0.15,
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [abierto]);

  function toggleAccion(id: AccionId) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function irAPasos() {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.current?.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
    panel.current?.focus({ preventScroll: true });
  }

  if (!abierto) {
    return (
      <div className="flex flex-col gap-4 rounded-r-xl border-l-4 border-brand bg-muted px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">¿Ya has actuado?</p>
          <p className="mt-1 text-(--text-secondary)">
            Cuéntanos qué pasó y te decimos qué hacer ahora.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={() => setAbierto(true)} className="shrink-0">
          Ya he pulsado →
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl leading-tight">¿Qué hiciste?</h2>
          <p className="mt-2 text-(--text-secondary)">
            Marca todo lo que corresponda.{" "}
            <span className="lg:hidden">Los pasos aparecen debajo.</span>
            <span className="hidden lg:inline">Los pasos aparecen a la derecha.</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSeleccion(new Set());
            setAbierto(false);
          }}
          className="shrink-0"
        >
          Cerrar
        </Button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-10">
        <ul className="flex flex-col gap-3 lg:sticky lg:top-6" role="group" aria-label="Acciones realizadas">
          {ACCIONES.map((accion) => {
            const activo = seleccion.has(accion.id);
            return (
              <li key={accion.id}>
                <button /* tema-ok: toggle de selección múltiple, no hay componente UI equivalente con aria-pressed */
                  type="button"
                  onClick={() => toggleAccion(accion.id)}
                  aria-pressed={activo}
                  className={cn(
                    "flex min-h-11 w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none",
                    activo ? "border-brand bg-brand/5" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm border-2",
                      activo
                        ? "border-brand bg-brand text-white" /* tema-ok: casilla marcada sobre brand, acento funcional */
                        : "border-border bg-background",
                    )}
                  >
                    {activo && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{accion.label}</span>
                    <span className="block text-(--text-secondary)">{accion.descripcion}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          ref={panel}
          id={ID_PASOS}
          tabIndex={-1}
          className="scroll-mt-6 outline-none"
        >
          <p className="sr-only" aria-live="polite">
            {pasos.length > 0 ? `${pasos.length} pasos para tu caso.` : ""}
          </p>
          {pasos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border px-6 py-10 text-center">
              <p className="font-medium text-foreground">Aquí verás qué hacer, en orden.</p>
              <p className="mt-1 text-(--text-secondary)">
                <span className="lg:hidden">Marca arriba lo que hiciste.</span>
                <span className="hidden lg:inline">Marca a la izquierda lo que hiciste.</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <Card className="gap-0 py-0 text-base">
                <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
                  <h3 className="text-lg font-semibold">Qué hacer ahora</h3>
                  <span className="font-mono text-xs uppercase text-(--text-secondary)">
                    {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
                  </span>
                </div>
                <ol className="flex flex-col">
                  {urgentes.length > 0 && (
                    <Grupo titulo="Primero, ahora mismo">
                      {urgentes.map((paso, i) => (
                        <PasoItem key={paso.id} paso={paso} numero={i + 1} />
                      ))}
                    </Grupo>
                  )}
                  {despues.length > 0 && (
                    <Grupo titulo={urgentes.length > 0 ? "Después" : "Qué hacer"}>
                      {despues.map((paso, i) => (
                        <PasoItem key={paso.id} paso={paso} numero={urgentes.length + i + 1} />
                      ))}
                    </Grupo>
                  )}
                </ol>
              </Card>
              <Fuentes fuentes={FUENTES} />
            </div>
          )}
        </div>
      </div>

      {pasos.length > 0 && !pasosALaVista && (
        <div className="fixed inset-x-4 bottom-4 z-20 lg:hidden">
          <a
            href={`#${ID_PASOS}`}
            onClick={(e) => {
              e.preventDefault();
              irAPasos();
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full bg-background text-base shadow-lg", // tema-ok: botón flotante, la sombra lo separa del contenido
            )}
          >
            Ver tus {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
            <ArrowDown aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <li className="border-b border-border px-5 py-5 last:border-b-0">
      <p className="font-mono text-xs uppercase text-(--text-secondary)">{titulo}</p>
      <ol className="mt-4 flex flex-col gap-5">{children}</ol>
    </li>
  );
}

function PasoItem({ paso, numero }: { paso: Paso; numero: number }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold",
          paso.urgente
            ? "bg-brand text-white" /* tema-ok: número de paso urgente sobre brand, acento funcional */
            : "bg-muted text-(--text-secondary)",
        )}
      >
        {numero}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-foreground">{paso.texto}</p>
        {paso.enlaces.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {paso.enlaces.map((enlace) => (
              <li key={enlace.url}>
                <a
                  href={enlace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-sm text-(--azul-importass) underline underline-offset-2 [overflow-wrap:anywhere] hover:text-(--azul-importass-oscuro) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--azul-importass-oscuro)"
                >
                  {enlace.texto}
                  <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
