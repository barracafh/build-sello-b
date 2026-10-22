"use client";

import { useEffect, useId, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconoWhatsApp } from "@/components/IconoWhatsApp";
import { enlaceWhatsApp } from "@/lib/compartir";
import { diccionario, type Idioma } from "@/i18n";

// Botones blancos sobre el verde. El anillo de foco en foreground: el gris de
// Sol apenas se ve sobre el verde.
// Con altura libre: en euskera algunos textos no caben en una línea a 320 px.
const boton =
  "h-auto min-h-12 gap-2 border-transparent px-5 py-2 text-lg whitespace-normal focus-visible:ring-foreground/60 max-sm:w-full";

// Franja verde WhatsApp con el título y los botones. El texto no se enseña: va
// dentro de los botones y se ve (y se puede cambiar) en WhatsApp o en la app
// elegida antes de enviarlo. Vive en el navegador: no pasa por nuestro servidor.
export function CompartirFamilia({
  titulo,
  texto,
  idioma = "es",
}: {
  titulo: string;
  texto: string;
  idioma?: Idioma;
}) {
  const id = useId();
  const t = diccionario(idioma).compartir;
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
      setAviso(t.copiado);
    } catch {
      setAviso(t.noCopiado);
    }
  }

  return (
    // Verde pastel de WhatsApp (src/styles/marcas.css) con el texto en foreground: 16:1.
    <Card
      render={<section aria-labelledby={`${id}-titulo`} />}
      className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 bg-whatsapp-pastel px-6 py-6 text-lg ring-0 md:px-8"
    >
      {/* h2: va fuera del resultado, al mismo nivel que él. */}
      <h2 id={`${id}-titulo`} className="font-sans text-xl font-semibold">
        {titulo}
      </h2>

      <div className="flex flex-wrap gap-3 max-sm:w-full">
        <a
          href={enlaceWhatsApp(texto)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), boton)}
        >
          {/* El logotipo en su verde, como lo usa la marca sobre blanco. */}
          <IconoWhatsApp className="size-5 text-whatsapp" />
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

      {/* Vacío, fuera de la fila pero en el árbol accesible: así el aviso se anuncia al llegar. */}
      <p role="status" className="w-full text-base font-medium empty:sr-only">
        {aviso}
      </p>
    </Card>
  );
}
