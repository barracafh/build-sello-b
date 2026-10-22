"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Check, CircleCheck, CircleX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/Fuentes";
import { avisosIncibe } from "@/datos/incibe";
import { NOMBRES_EJEMPLOS } from "@/datos/ejemplos";
import {
  RONDAS,
  UMBRAL_DESLIZAR,
  barajar,
  respuestaDeArrastre,
  valoracion,
  type Ronda,
} from "@/lib/juego";

type Respuesta = { id: string; dijoEstafa: boolean; acierto: boolean };

// Una línea a 320 px: icono de 24 px, «De verdad» a 18 px y 8 px de margen.
const botonRespuesta = "h-14 gap-1.5 px-2 text-lg whitespace-nowrap";

// Lo que tarda la tarjeta en salir volando antes de enseñar la solución.
const SALIDA_MS = 220;

const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Diez tarjetas, una cada vez, como en Tinder: a la izquierda «estafa», a la
// derecha «de verdad». También con los botones o con las flechas del teclado.
// No se guarda nada: las respuestas viven solo en el estado de la página.
export function JuegoEstafas() {
  // Primero en el orden del fichero (igual en servidor y navegador); se baraja al montar.
  const [rondas, setRondas] = useState<readonly Ronda[]>(RONDAS);
  const [barajado, setBarajado] = useState(false);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [dx, setDx] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [saliendo, setSaliendo] = useState<-1 | 1 | null>(null);
  const inicio = useRef<number | null>(null);
  const arrastre = useRef(0);
  const enfocarTarjeta = useRef(false);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const solucionRef = useRef<HTMLHeadingElement>(null);
  const finRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setRondas(barajar(RONDAS));
    setBarajado(true);
  }, []);

  const ronda = rondas[indice] as Ronda | undefined;
  const respuesta = ronda && respuestas.find((r) => r.id === ronda.id);
  const fin = indice >= rondas.length;
  const aciertos = respuestas.filter((r) => r.acierto).length;

  function responder(dijoEstafa: boolean) {
    if (!ronda || respuesta || saliendo) return;
    const guardar = () => {
      setRespuestas((todas) => [
        ...todas,
        { id: ronda.id, dijoEstafa, acierto: dijoEstafa === ronda.esEstafa },
      ]);
      setSaliendo(null);
      setDx(0);
    };
    if (reducirMovimiento()) return guardar();
    setSaliendo(dijoEstafa ? -1 : 1);
    window.setTimeout(guardar, SALIDA_MS);
  }

  function siguiente() {
    enfocarTarjeta.current = true;
    setIndice((i) => i + 1);
  }

  function otraVez() {
    enfocarTarjeta.current = true;
    setRondas(barajar(RONDAS));
    setRespuestas([]);
    setIndice(0);
  }

  // Foco: a la solución al responder, a la tarjeta al pasar y al titular al acabar.
  useEffect(() => {
    if (respuesta) solucionRef.current?.focus();
  }, [respuesta]);
  useEffect(() => {
    if (fin) finRef.current?.focus();
    else if (enfocarTarjeta.current) tarjetaRef.current?.focus();
    enfocarTarjeta.current = false;
  }, [indice, fin]);

  // Flechas ← → mientras hay una tarjeta por responder.
  const responderActual = useRef(responder);
  responderActual.current = responder;
  useEffect(() => {
    function tecla(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") responderActual.current(true);
      if (event.key === "ArrowRight") responderActual.current(false);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  function empezarArrastre(event: PointerEvent<HTMLDivElement>) {
    if (respuesta || saliendo || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    inicio.current = event.clientX;
    arrastre.current = 0;
    setArrastrando(true);
  }

  function arrastrar(event: PointerEvent<HTMLDivElement>) {
    if (inicio.current === null || !event.isPrimary) return;
    arrastre.current = event.clientX - inicio.current;
    setDx(arrastre.current);
  }

  // Si el navegador cancela el gesto (por ejemplo, para hacer scroll), la tarjeta vuelve.
  function soltar(event: PointerEvent<HTMLDivElement>) {
    if (inicio.current === null || !event.isPrimary) return;
    inicio.current = null;
    setArrastrando(false);
    const dijoEstafa = event.type === "pointercancel" ? null : respuestaDeArrastre(arrastre.current);
    if (dijoEstafa === null) setDx(0);
    else responder(dijoEstafa);
  }

  if (fin) {
    const fuentes = [avisosIncibe, ...rondas.map((r) => r.fuente)].filter(
      (f, i, todas) => todas.findIndex((o) => o.url === f.url) === i,
    );
    return (
      <section aria-labelledby="juego-fin" className="text-lg [&>*+*]:mt-10">
        <div>
          <h2
            ref={finRef}
            id="juego-fin"
            tabIndex={-1}
            className="font-heading text-[clamp(30px,5vw,44px)] leading-[1.12] outline-none"
          >
            Has acertado <span className="tabular-nums">{aciertos}</span> de{" "}
            <span className="tabular-nums">{rondas.length}</span>
          </h2>
          <p className="mt-3 text-xl font-semibold">{valoracion(aciertos, rondas.length)}</p>
          <p className="mt-2 text-(--text-secondary)">
            Recuerda: aunque un aviso sea de verdad, entra tú en la web oficial
            escribiendo la dirección. Un mensaje no prueba quién lo envía.
          </p>
        </div>

        <ol className="grid gap-3" aria-label="Tus respuestas">
          {rondas.map((r) => {
            const tuya = respuestas.find((x) => x.id === r.id);
            const Icono = tuya?.acierto ? CircleCheck : CircleX;
            return (
              <li key={r.id} className="flex items-start gap-3">
                <Icono
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-6 shrink-0",
                    tuya?.acierto ? "text-iss-success-700" : "text-destructive",
                  )}
                />
                <span>
                  <span className="sr-only">{tuya?.acierto ? "Acertada: " : "Fallada: "}</span>
                  {NOMBRES_EJEMPLOS[r.id] ?? r.id}:{" "}
                  <span className="font-semibold">{r.esEstafa ? "estafa" : "de verdad"}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="sunset"
            size="lg"
            onClick={otraVez}
            className="h-14 px-6 text-lg max-sm:w-full"
          >
            Jugar otra vez
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-auto min-h-14 px-6 py-2 text-lg whitespace-normal max-sm:w-full",
            )}
          >
            Comprobar un mensaje real
          </Link>
        </div>

        <Fuentes fuentes={fuentes} />
      </section>
    );
  }

  if (!ronda) return null;

  // Cuánto se ve cada etiqueta mientras se arrastra (0 a 1).
  const haciaEstafa = Math.min(1, Math.max(0, -dx / UMBRAL_DESLIZAR));
  const haciaVerdad = Math.min(1, Math.max(0, dx / UMBRAL_DESLIZAR));
  const desplazamiento = saliendo ? saliendo * 600 : dx;
  const siguienteRonda = rondas[indice + 1];

  return (
    <div className="text-lg">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-medium">
          Mensaje <span className="tabular-nums">{indice + 1}</span> de{" "}
          <span className="tabular-nums">{rondas.length}</span>
        </p>
        <p className="text-(--text-secondary)">
          Aciertos: <span className="tabular-nums">{aciertos}</span>
        </p>
      </div>
      <div
        aria-hidden="true"
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${((indice + (respuesta ? 1 : 0)) / rondas.length) * 100}%` }}
        />
      </div>

      {!respuesta ? (
        <>
          {/* La pila: la siguiente tarjeta asoma por detrás, en gris. Oculta hasta
              barajar, para que no cambie la tarjeta ya a la vista. Sin recorte aquí:
              la página recorta a lo ancho para que la tarjeta pueda salir volando. */}
          <div className={cn("relative mt-6 pb-3", !barajado && "invisible")}>
            {siguienteRonda && (
              <div
                aria-hidden="true"
                className="absolute inset-x-4 top-3 bottom-0 rounded-xl bg-muted ring-1 ring-foreground/10"
              />
            )}
            <div
              ref={tarjetaRef}
              tabIndex={-1}
              role="group"
              aria-roledescription="tarjeta"
              aria-label={`Mensaje ${indice + 1}: ${ronda.tipo}`}
              onPointerDown={empezarArrastre}
              onPointerMove={arrastrar}
              onPointerUp={soltar}
              onPointerCancel={soltar}
              style={{
                transform: `translateX(${desplazamiento}px) rotate(${desplazamiento / 20}deg)`,
              }}
              className={cn(
                "relative cursor-grab touch-pan-y outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl",
                arrastrando ? "cursor-grabbing" : "motion-safe:transition-transform motion-safe:duration-200",
              )}
            >
              <Card className="min-h-64 gap-0 px-6 py-6 text-lg md:px-8 md:py-8">
                {/* Se apaga mientras aparece el sello, que va encima. */}
                <span
                  style={{ opacity: 1 - Math.max(haciaEstafa, haciaVerdad) }}
                  className="font-mono text-sm tracking-[0.06em] text-(--text-secondary) uppercase"
                >
                  {ronda.tipo}
                </span>
                <p className="mt-4 text-lg leading-relaxed [overflow-wrap:anywhere] md:text-xl">{ronda.texto}</p>
                {ronda.direccion && (
                  // Neutralizada y como texto: nunca un enlace.
                  <p className="mt-4">
                    <code className="font-mono text-base [overflow-wrap:anywhere]">
                      {ronda.direccion}
                    </code>
                  </p>
                )}
              </Card>

              {/* Sellos que aparecen al arrastrar. */}
              <span
                aria-hidden="true"
                style={{ opacity: haciaEstafa }}
                className="pointer-events-none absolute top-6 right-6 -rotate-12 rounded-lg border-3 border-destructive bg-background px-3 py-1 text-2xl font-bold tracking-wide text-destructive uppercase"
              >
                Estafa
              </span>
              <span
                aria-hidden="true"
                style={{ opacity: haciaVerdad }}
                className="pointer-events-none absolute top-6 left-6 rotate-12 rounded-lg border-3 border-iss-success-700 bg-background px-3 py-1 text-2xl font-bold tracking-wide text-iss-success-700 uppercase"
              >
                De verdad
              </span>
            </div>
          </div>

          {/* En el móvil, los botones se quedan pegados abajo: la tarjeta y la
              respuesta siempre a la vista, aunque el mensaje sea largo. */}
          <div className="mt-6 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-(--page-gutter) max-md:border-t max-md:border-border max-md:bg-background max-md:px-(--page-gutter) max-md:pt-3 max-md:pb-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => responder(true)}
                className={botonRespuesta}
              >
                <X aria-hidden="true" className="size-6 text-destructive" />
                Estafa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => responder(false)}
                className={botonRespuesta}
              >
                <Check aria-hidden="true" className="size-6 text-iss-success-700" />
                De verdad
              </Button>
            </div>
            {/* Con dedo no hay teclado: solo se habla de deslizar. */}
            <p className="mt-2 text-center text-base text-(--text-secondary) md:mt-3">
              Desliza la tarjeta
              <span className="pointer-coarse:hidden">
                {" "}o usa las flechas <kbd className="font-mono">←</kbd> y{" "}
                <kbd className="font-mono">→</kbd> del teclado
              </span>
              .
            </p>
          </div>
        </>
      ) : (
        <Solucion
          ronda={ronda}
          respuesta={respuesta}
          ultima={indice === rondas.length - 1}
          tituloRef={solucionRef}
          onSiguiente={siguiente}
        />
      )}
    </div>
  );
}

function Solucion({
  ronda,
  respuesta,
  ultima,
  tituloRef,
  onSiguiente,
}: {
  ronda: Ronda;
  respuesta: Respuesta;
  ultima: boolean;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  onSiguiente: () => void;
}) {
  const Icono = respuesta.acierto ? CircleCheck : CircleX;
  return (
    <Card render={<section aria-labelledby="juego-solucion" />} className="mt-6 gap-0 py-0 text-lg">
      <div
        className={cn(
          "px-6 py-6 md:px-8",
          respuesta.acierto ? "bg-iss-success-700/20" : "bg-destructive/10",
        )}
      >
        <h2
          ref={tituloRef}
          id="juego-solucion"
          tabIndex={-1}
          className="flex items-center gap-3 font-sans text-2xl font-semibold outline-none"
        >
          <Icono
            aria-hidden="true"
            className={cn("size-8 shrink-0", respuesta.acierto ? "text-iss-success-700" : "text-destructive")}
          />
          {respuesta.acierto ? "¡Bien visto!" : "Esta no"}
        </h2>
        <p className="mt-2 text-xl">
          {ronda.esEstafa
            ? "Es una estafa real que ha avisado INCIBE."
            : "Es un aviso de verdad. Aun así, no te fíes del mensaje: entra tú en la web oficial."}
        </p>
      </div>

      <div className="px-6 py-6 md:px-8 [&>*+*]:mt-6">
        <div>
          <h3 className="font-semibold">Las pistas</h3>
          <ul className="mt-3 grid list-disc gap-2 pl-6">
            {ronda.pistas.slice(0, 3).map((pista) => (
              <li key={pista}>{pista}</li>
            ))}
          </ul>
        </div>
        {ronda.web && (
          <p>
            La web oficial es{" "}
            <a
              href={ronda.web.href}
              className="font-mono underline underline-offset-4 [overflow-wrap:anywhere]"
            >
              {ronda.web.direccion}
            </a>
          </p>
        )}
        <p className="text-base text-(--text-secondary)">
          Fuente:{" "}
          <a href={ronda.fuente.url} className="underline underline-offset-4">
            {ronda.fuente.nombre}
          </a>
        </p>
        <Button
          type="button"
          variant="sunset"
          size="lg"
          onClick={onSiguiente}
          className="h-14 px-6 text-lg max-sm:w-full"
        >
          {ultima ? "Ver mi resultado" : "Siguiente mensaje"}
        </Button>
      </div>
    </Card>
  );
}
