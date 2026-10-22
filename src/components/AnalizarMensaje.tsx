"use client";

import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { ruta } from "@/config/sitio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import ejemplos from "../../datos/mensajes-ejemplo.json";

// El texto vive en el estado del navegador y se envía solo a /api/verificar,
// que no lo guarda ni lo registra. Mientras no haya análisis, la respuesta es
// la de la duda: no_determinable.
const LIMITE = 2000;

type Respuesta = {
  veredicto: string;
  motivo: string;
  url_analizada: string | null;
};

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};

const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

const linea017 = {
  nombre: "Línea 017 de INCIBE",
  url: "https://www.incibe.es/linea-de-ayuda-en-ciberseguridad",
};
const avisosIncibe = {
  nombre: "INCIBE · Avisos a la ciudadanía",
  url: "https://www.incibe.es/ciudadania/avisos",
};

export function AnalizarMensaje() {
  const id = useId();
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function analizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRespuesta(null);
    if (mensaje.trim().length === 0) {
      setError("Escribe o pega un mensaje antes de comprobar.");
      return;
    }
    if (mensaje.length > LIMITE) {
      setError(
        `El mensaje es demasiado largo: ${mensaje.length} de ${LIMITE} caracteres como máximo.`,
      );
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(ruta("/api/verificar"), {
        method: "POST",
        body: JSON.stringify({ texto: mensaje }),
      });
      if (!res.ok) throw new Error();
      setRespuesta((await res.json()) as Respuesta);
    } catch {
      setError("No hemos podido comprobarlo. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function cargar(texto: string) {
    setMensaje(texto);
    setRespuesta(null);
    setError(null);
  }

  return (
    <div className="[&>*+*]:mt-12">
      <form onSubmit={analizar} aria-describedby={`${id}-privacidad`}>
        <label htmlFor={`${id}-mensaje`} className="block font-medium">
          Pega aquí el enlace, el SMS o el correo
        </label>
        <p id={`${id}-ayuda`} className="mt-1 text-(--text-secondary)">
          Incluye el remitente y el enlace tal como aparecen. No pulses el
          enlace.
        </p>
        <Textarea
          id={`${id}-mensaje`}
          name="mensaje"
          aria-describedby={cn(
            `${id}-ayuda`,
            `${id}-contador`,
            error && `${id}-error`,
          )}
          aria-invalid={error ? true : undefined}
          value={mensaje}
          onChange={(event) => {
            setMensaje(event.target.value);
            setRespuesta(null);
            setError(null);
          }}
          rows={6}
          spellCheck={false}
          autoComplete="off"
          placeholder="DGT: Dispone de 24 horas para pagar su multa. Consulte en el siguiente enlace: hxxps://…"
          className="mt-4 min-h-40 px-4 py-3 text-base md:text-base [overflow-wrap:anywhere]"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-(--text-secondary)">
          <p id={`${id}-privacidad`}>
            No guardamos lo que pegas ni abrimos sus enlaces.
          </p>
          <p id={`${id}-contador`} className="font-mono tabular-nums">
            {mensaje.length}/{LIMITE}
          </p>
        </div>
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-2 font-medium text-destructive"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="sunset"
            size="lg"
            disabled={enviando}
            className="h-11 px-5 text-base max-sm:w-full"
          >
            Comprobar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => cargar("")}
            className="h-11 px-5 text-base max-sm:w-full"
          >
            Borrar
          </Button>
        </div>
      </form>

      <section aria-labelledby={`${id}-ejemplos`}>
        <h2
          id={`${id}-ejemplos`}
          className="font-sans text-sm font-medium text-(--text-secondary)"
        >
          Ejemplos
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ejemplos.map((caso) => (
            <Button
              key={caso.id}
              type="button"
              variant="outline"
              onClick={() => cargar(textoDeEjemplo(caso as Ejemplo))}
              className="h-11 px-4 text-base"
            >
              {caso.id}
            </Button>
          ))}
        </div>
      </section>

      <section aria-live="polite" aria-labelledby={`${id}-resultado`}>
        {respuesta && (
          <div className="text-lg [&>*+*]:mt-8">
            <div>
              <Badge variant="outline" className="font-mono">
                {respuesta.veredicto}
              </Badge>
              <h2
                id={`${id}-resultado`}
                className="mt-3 text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
              >
                No podemos confirmarlo
              </h2>
              <p className="mt-3 text-(--text-secondary)">
                {respuesta.motivo}. Hasta entonces, trata el mensaje como no
                verificado.
              </p>
              <p className="mt-3 text-base">
                URL analizada:{" "}
                <code className="font-mono [overflow-wrap:anywhere]">
                  {respuesta.url_analizada ?? "ninguna"}
                </code>
              </p>
            </div>

            <ol className="grid gap-5">
              {[
                "No pulses el enlace ni respondas al mensaje.",
                "Entra tú en la web oficial del organismo escribiendo su dirección.",
                "Si dudas o ya has dado datos, llama gratis al 017 de INCIBE.",
              ].map((paso, i) => (
                <li
                  key={paso}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                >
                  <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                    {i + 1}
                  </span>
                  <p>{paso}</p>
                </li>
              ))}
            </ol>

            <Card
              render={<section />}
              className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 text-base"
            >
              <div className="min-w-0 flex-[1_1_260px]">
                <p className="text-sm text-(--text-secondary)">
                  ¿Dudas? Pide ayuda
                </p>
                <h3 className="mt-1 text-lg leading-[1.35] font-medium">
                  Línea 017 de INCIBE, gratuita y confidencial
                </h3>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  De 8:00 a 23:00, los 365 días.
                </p>
              </div>
              <a
                href={linea017.url}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5 text-base max-md:w-full",
                )}
              >
                Ver cómo contactar <span aria-hidden="true">↗</span>
              </a>
            </Card>

            <Fuentes fuentes={[avisosIncibe, linea017]} />
          </div>
        )}
      </section>
    </div>
  );
}
