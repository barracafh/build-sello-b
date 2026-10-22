import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";

export type Seccion = "verificar" | "juego";

const SECCIONES: { id: Seccion; href: string; nombre: string }[] = [
  { id: "verificar", href: "/", nombre: "Comprobar un mensaje" },
  { id: "juego", href: "/juego", nombre: "Juego: ¿estafa o no?" },
];

// Cabecera común: icono, nombre y frase de ficha.json y el menú de secciones.
export function Cabecera({ activa }: { activa: Seccion }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-24 max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        {/* Icono, nombre y frase de ficha.json: sin logotipos de la Administración. */}
        <span className="inline-flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand font-mono text-3xl text-white" /* tema-ok: icono de la plantilla sobre brand */
          >
            {ficha.icono}
          </span>
          <span className="flex flex-col">
            <span className="text-2xl leading-tight font-semibold tracking-tight">
              {ficha.nombre}
            </span>
            <span className="text-base text-(--text-secondary)">{ficha.frase}</span>
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <nav aria-label="Secciones">
            <ul className="flex flex-wrap gap-2">
              {SECCIONES.map((seccion) => (
                <li key={seccion.id}>
                  <Link
                    href={seccion.href}
                    aria-current={seccion.id === activa ? "page" : undefined}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 px-4 text-base",
                      // La sección actual, marcada sin color nuevo: borde de texto y fondo muted.
                      seccion.id === activa && "border-foreground bg-muted font-semibold",
                    )}
                  >
                    {seccion.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Badge variant="outline">
            {ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
