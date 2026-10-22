import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";

export type Seccion = "verificar" | "juego";

// `corto` es el nombre en el móvil, para que las dos quepan en una fila a 320 px.
const SECCIONES: { id: Seccion; href: string; nombre: string; corto: string }[] = [
  { id: "verificar", href: "/", nombre: "Comprobar un mensaje", corto: "Comprobar" },
  { id: "juego", href: "/juego", nombre: "Juego: ¿estafa o no?", corto: "¿Estafa o no?" },
];

// Cabecera común: icono, nombre y frase de ficha.json y el menú de secciones.
export function Cabecera({ activa }: { activa: Seccion }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-24 max-w-5xl flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-4 md:px-8">
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
        <Badge variant="outline" className="lg:order-last">
          {ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}
        </Badge>
        {/* En el móvil, una fila propia con las dos secciones a partes iguales. */}
        <nav aria-label="Secciones" className="w-full lg:ml-auto lg:w-auto">
          <ul className="grid grid-cols-2 gap-2 lg:flex">
            {SECCIONES.map((seccion) => (
              <li key={seccion.id}>
                <Link
                  href={seccion.href}
                  aria-current={seccion.id === activa ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 w-full px-4 text-base",
                    // La sección actual, marcada sin color nuevo: borde de texto y fondo muted.
                    seccion.id === activa && "border-foreground bg-muted font-semibold",
                  )}
                >
                  <span className="lg:hidden">{seccion.corto}</span>
                  <span className="max-lg:hidden">{seccion.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
