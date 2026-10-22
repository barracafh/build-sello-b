"use client";

import { useEffect, useId, useState } from "react";
import { Copy, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { enlaceWhatsApp } from "@/lib/compartir";
import { diccionario, type Idioma } from "@/i18n";

const boton = "h-12 gap-2 px-5 text-lg max-sm:w-full";

// Enseña el texto que se va a mandar en una caja como la principal, editable,
// y lo envía por WhatsApp, por el menú de compartir del móvil o copiándolo. El
// texto vive en el navegador: no pasa por nuestro servidor.
export function CompartirFamilia({
  titulo,
  explicacion,
  texto,
  idioma = "es",
}: {
  titulo: string;
  explicacion: string;
  texto: string;
  idioma?: Idioma;
}) {
  const id = useId();
  const t = diccionario(idioma).compartir;
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
      setAviso(t.copiado);
    } catch {
      setAviso(t.noCopiado);
    }
  }

  return (
    <Card
      render={<section aria-labelledby={`${id}-titulo`} />}
      className="gap-0 px-6 py-6 text-lg md:px-8 md:py-8"
    >
      {/* h2: va fuera del resultado, al mismo nivel que él. */}
      <h2 id={`${id}-titulo`} className="font-sans text-xl font-semibold">
        {titulo}
      </h2>
      <p className="mt-2 text-(--text-secondary)">{explicacion}</p>

      <label htmlFor={`${id}-texto`} className="mt-4 block font-medium">
        {t.etiqueta}
      </label>
      {/* Las mismas clases que la caja principal de AnalizarMensaje. */}
      <Textarea
        id={`${id}-texto`}
        value={valor}
        onChange={(event) => {
          setValor(event.target.value);
          setAviso(null);
        }}
        rows={10}
        spellCheck={false}
        autoComplete="off"
        className="mt-4 min-h-44 px-4 py-3 text-lg leading-relaxed md:text-lg [overflow-wrap:anywhere]"
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={enlaceWhatsApp(valor)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), boton)}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          {t.whatsapp}
          <span className="sr-only">{t.otraVentana}</span>
        </a>
        {puedeCompartir && (
          <Button type="button" variant="outline" size="lg" onClick={compartir} className={boton}>
            <Share2 aria-hidden="true" className="size-5" />
            {t.otraApp}
          </Button>
        )}
        <Button type="button" variant="outline" size="lg" onClick={copiar} className={boton}>
          <Copy aria-hidden="true" className="size-5" />
          {t.copiar}
        </Button>
      </div>
      <p role="status" className="mt-3 text-base font-medium empty:mt-0">
        {aviso}
      </p>
    </Card>
  );
}
