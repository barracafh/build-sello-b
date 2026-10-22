"use client";

import { useEffect, useId, useState } from "react";
import { Copy, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { enlaceWhatsApp } from "@/lib/compartir";

const boton = "h-12 gap-2 px-5 text-lg max-sm:w-full";

// Enseña el texto tal cual se va a mandar y lo envía por WhatsApp, por el menú
// de compartir del móvil o copiándolo. El texto se arma en el navegador: no
// pasa por nuestro servidor.
export function CompartirFamilia({
  titulo,
  explicacion,
  texto,
  encabezado: Encabezado = "h3",
}: {
  titulo: string;
  explicacion: string;
  texto: string;
  encabezado?: "h2" | "h3";
}) {
  const id = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  // `navigator.share` solo existe en el navegador (y no en todos): se mira al montar.
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  useEffect(() => setPuedeCompartir(typeof navigator.share === "function"), []);
  useEffect(() => setAviso(null), [texto]);

  async function compartir() {
    try {
      await navigator.share({ text: texto });
    } catch {
      // Cancelado por la persona o sin permiso: no hay nada que avisar.
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setAviso("Texto copiado. Pégalo en el chat de tu familia.");
    } catch {
      setAviso("No hemos podido copiarlo. Selecciona el texto de arriba y cópialo.");
    }
  }

  return (
    <Card
      render={<section aria-labelledby={`${id}-titulo`} />}
      className="gap-0 px-6 py-6 text-lg md:px-8 md:py-8"
    >
      <Encabezado id={`${id}-titulo`} className="font-sans text-xl font-semibold">
        {titulo}
      </Encabezado>
      <p className="mt-2 text-(--text-secondary)">{explicacion}</p>

      <p className="mt-4 text-base font-medium">Esto es lo que se envía:</p>
      <blockquote className="mt-2 rounded-lg bg-muted px-4 py-3 text-base whitespace-pre-line [overflow-wrap:anywhere]">
        {texto}
      </blockquote>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={enlaceWhatsApp(texto)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), boton)}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          Enviar por WhatsApp
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
          Copiar el texto
        </Button>
      </div>
      <p role="status" className="mt-3 text-base font-medium empty:mt-0">
        {aviso}
      </p>
    </Card>
  );
}
