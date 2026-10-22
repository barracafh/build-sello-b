"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// <details> nativo: se abre con teclado y lector sin JavaScript. `abiertoEnEscritorio`
// lo abre al montar a partir de lg (64rem); en el móvil empieza cerrado.
export function Desplegable({
  resumen,
  children,
  abiertoEnEscritorio = false,
  className,
}: {
  resumen: ReactNode;
  children: ReactNode;
  abiertoEnEscritorio?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (abiertoEnEscritorio && ref.current && window.matchMedia("(min-width: 64rem)").matches)
      ref.current.open = true;
  }, [abiertoEnEscritorio]);

  return (
    <details ref={ref} className={cn("group", className)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        {resumen}
        <ChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 group-open:rotate-180 motion-safe:transition-transform"
        />
      </summary>
      {children}
    </details>
  );
}
