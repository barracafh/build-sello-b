import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";
import { Marca } from "@/components/Marca";
import { SelectorIdioma } from "@/components/SelectorIdioma";
import { diccionario, type Idioma } from "@/i18n";

export type Seccion = "verificar" | "juego";

// Los nombres de cada sección, en `cabecera.menu` (src/i18n/).
const SECCIONES: { id: Seccion; href: string }[] = [
  { id: "verificar", href: "/" },
  { id: "juego", href: "/juego" },
];

// Cabecera común: marca y nombre de ficha.json, la frase en el idioma elegido y el menú de secciones.
export function Cabecera({ activa, idioma = "es" }: { activa: Seccion; idioma?: Idioma }) {
  const t = diccionario(idioma);
  return (
    <header className="border-b border-border bg-background">
      {/* gap-x-2, el mismo hueco que entre los botones del menú: así botones y
          selector quedan a 8 px unos de otros. Entre filas (móvil), 16 px. */}
      <div className="mx-auto flex min-h-24 max-w-5xl flex-wrap items-center justify-between gap-x-2 gap-y-4 px-(--page-gutter) py-4 md:px-8">
        {/* Marca y nombre de ficha.json, sin logotipos de la Administración. Llevan al inicio. */}
        <Link
          href={{ pathname: "/", query: { lang: idioma } }}
          className="-m-1.5 inline-flex items-center gap-3 rounded-2xl p-1.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4"
        >
          <Marca className="size-12 shrink-0 sm:size-14" />
          <span className="flex flex-col gap-1.5">
            {/* El nombre hace de logotipo: seminegrita, más cerrada y sin interlineado. El
                espacio de detrás lo separa de la frase en el nombre accesible del enlace. */}
            <span className="text-[26px] leading-none font-semibold tracking-[-0.025em] sm:text-[28px]">
              {ficha.nombre}
            </span>{" "}
            <span className="text-base leading-snug text-(--text-secondary)">{t.cabecera.frase}</span>
          </span>
        </Link>
        <span className="lg:order-last">
          <SelectorIdioma idioma={idioma} etiqueta={t.selector.etiqueta} />
        </span>
        {/* En el móvil, una fila propia con las dos secciones a partes iguales. */}
        <nav aria-label={t.cabecera.secciones} className="w-full lg:ml-auto lg:w-auto">
          <ul className="grid grid-cols-2 gap-2 lg:flex">
            {SECCIONES.map((seccion) => (
              <li key={seccion.id}>
                <Link
                  // Con ?lang, el idioma elegido se mantiene al cambiar de sección.
                  href={{ pathname: seccion.href, query: { lang: idioma } }}
                  aria-current={seccion.id === activa ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 w-full px-4 text-base",
                    // La sección actual, marcada sin color nuevo: borde de texto y fondo muted.
                    seccion.id === activa && "border-foreground bg-muted font-semibold",
                  )}
                >
                  <span className="lg:hidden">{t.cabecera.menu[seccion.id].corto}</span>
                  <span className="max-lg:hidden">{t.cabecera.menu[seccion.id].nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
