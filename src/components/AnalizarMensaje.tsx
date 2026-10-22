"use client";

import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";

// Primera iteración: solo la interfaz. El texto vive en el estado del
// navegador, no se envía a ningún sitio ni se guarda. Mientras no haya
// análisis, la respuesta es la de la duda: no_determinable.
const LIMITE = 2000;

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
  const [analizado, setAnalizado] = useState(false);
  const vacio = mensaje.trim().length === 0;

  function analizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (vacio) return;
    setAnalizado(true);
  }

  function borrar() {
    setMensaje("");
    setAnalizado(false);
  }

  return (
    <div className="[&>*+*]:mt-12">
      <form onSubmit={analizar} aria-describedby={`${id}-privacidad`}>
        <label htmlFor={`${id}-mensaje`} className="block font-medium">
          Pega el SMS, el correo o la web que te ha llegado
        </label>
        <p id={`${id}-ayuda`} className="mt-1 text-(--text-secondary)">
          Incluye el remitente y el enlace tal como aparecen. No pulses el
          enlace.
        </p>
        <Textarea
          id={`${id}-mensaje`}
          name="mensaje"
          aria-describedby={`${id}-ayuda ${id}-contador`}
          value={mensaje}
          onChange={(event) => {
            setMensaje(event.target.value);
            setAnalizado(false);
          }}
          maxLength={LIMITE}
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
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="sunset"
            size="lg"
            disabled={vacio}
            className="h-11 px-5 text-base max-sm:w-full"
          >
            Analizar mensaje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={borrar}
            disabled={vacio}
            className="h-11 px-5 text-base max-sm:w-full"
          >
            Borrar
          </Button>
        </div>
      </form>

      <section aria-live="polite" aria-labelledby={`${id}-resultado`}>
        {analizado && (
          <div className="text-lg [&>*+*]:mt-8">
            <div>
              <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
                no_determinable
              </p>
              <h2
                id={`${id}-resultado`}
                className="mt-3 text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
              >
                No podemos confirmarlo
              </h2>
              <p className="mt-3 text-(--text-secondary)">
                El análisis automático llega en la siguiente versión. Hasta
                entonces, trata el mensaje como no verificado.
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
