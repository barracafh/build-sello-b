"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { IDIOMAS, NOMBRES, langHtml, type Idioma } from "@/i18n";

// Cambia ?lang y conserva el resto de parámetros (p. ej. casos-test).
export function SelectorIdioma({ idioma, etiqueta }: { idioma: Idioma; etiqueta: string }) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const cambiar = (nuevo: string) => {
    const siguiente = new URLSearchParams(params.toString());
    siguiente.set("lang", nuevo);
    router.replace(`${pathname}?${siguiente.toString()}${window.location.hash}`, { scroll: false });
  };

  return (
    <span className="relative inline-flex items-center">
      {/* «Idioma» solo para lectores de pantalla: a la vista basta con el selector. */}
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <select
        id={id}
        value={idioma}
        onChange={(e) => cambiar(e.target.value)}
        // h-12, como los botones del menú, para que la fila quede alineada. Sin la
        // flecha nativa (pegada al borde y distinta en cada navegador): va la de abajo.
        className="h-12 min-w-0 appearance-none rounded-lg border border-input bg-background pr-10 pl-3 text-base text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {IDIOMAS.map((codigo) => (
          <option key={codigo} value={codigo} lang={langHtml(codigo)}>
            {NOMBRES[codigo]}
          </option>
        ))}
      </select>
      {/* Centrada en vertical y a 12 px del borde, como el texto por la izquierda. */}
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-foreground"
      />
    </span>
  );
}
