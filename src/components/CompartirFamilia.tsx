"use client";

import { useEffect, useId, useState } from "react";
import { Copy, Link2, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Desplegable } from "@/components/Desplegable";
import { enlaceWhatsApp } from "@/lib/compartir";

const boton = "h-12 flex-[1_1_8rem] gap-2 px-4 text-lg";

// Compartir el resultado en un solo bloque (LAB-69): WhatsApp, copiar el texto
// o copiar el enlace. El texto propuesto se ve y se edita en un desplegable
// cerrado. Vive en el navegador: no pasa por nuestro servidor.
export function CompartirFamilia({
  texto,
  onCopiarEnlace,
}: {
  texto: string;
  /** Copia el enlace al resultado y devuelve el aviso que hay que enseñar. */
  onCopiarEnlace: () => Promise<string>;
}) {
  const id = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  // Se puede editar; si cambia el resultado, vuelve al texto propuesto.
  const [valor, setValor] = useState(texto);
  useEffect(() => setValor(texto), [texto]);
  // `navigator.share` solo existe en el navegador (y no en todos): se mira al montar.
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  useEffect(() => setPuedeCompartir(typeof navigator.share === "function"), []);
  useEffect(() => setAviso(null), [texto]);

  async function compartir() {
    try {
      await navigator.share({ text: valor });
    } catch {
      // Cancelado por la persona o sin permiso: no hay nada que avisar.
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setAviso("Texto copiado. Pégalo en el chat de tu familia.");
    } catch {
      setAviso("No hemos podido copiarlo. Abre «Ver y editar el texto» y cópialo de la caja.");
    }
  }

  return (
    <Card
      render={<section aria-labelledby={`${id}-titulo`} />}
      className="gap-0 px-6 py-6 text-lg md:px-8"
    >
      <h3 id={`${id}-titulo`} className="text-xl font-semibold">
        Mándaselo a tu familia
      </h3>
      <p className="mt-1 text-base text-(--text-secondary)">
        No lo compartas si lleva datos personales: el texto y el enlace incluyen tu mensaje.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={enlaceWhatsApp(valor)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), boton)}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          WhatsApp
          <span className="sr-only"> (se abre en otra ventana)</span>
        </a>
        {puedeCompartir && (
          <Button type="button" variant="outline" size="lg" onClick={compartir} className={boton}>
            <Share2 aria-hidden="true" className="size-5" />
            Otra app
          </Button>
        )}
        <Button type="button" variant="outline" size="lg" onClick={copiar} className={boton}>
          <Copy aria-hidden="true" className="size-5" />
          Copiar texto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={async () => setAviso(await onCopiarEnlace())}
          className={boton}
        >
          <Link2 aria-hidden="true" className="size-5" />
          Copiar enlace
        </Button>
      </div>
      <p role="status" className="mt-3 text-base font-medium empty:mt-0">
        {aviso}
      </p>

      <Desplegable
        className="mt-3"
        resumen={<span className="font-medium">Ver y editar el texto</span>}
      >
        <label htmlFor={`${id}-texto`} className="mt-2 block text-base text-(--text-secondary)">
          Esto es lo que se envía. Puedes cambiarlo:
        </label>
        {/* Las mismas clases que la caja principal de AnalizarMensaje. */}
        <Textarea
          id={`${id}-texto`}
          value={valor}
          onChange={(event) => {
            setValor(event.target.value);
            setAviso(null);
          }}
          rows={8}
          spellCheck={false}
          autoComplete="off"
          className="mt-2 min-h-44 px-4 py-3 text-lg leading-relaxed md:text-lg [overflow-wrap:anywhere]"
        />
      </Desplegable>
    </Card>
  );
}
