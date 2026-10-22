import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";
import { SelectorIdioma } from "@/components/SelectorIdioma";
import { diccionario, type Idioma } from "@/i18n";

export type Seccion = "verificar" | "juego";

// Los nombres de cada sección, en `cabecera.menu` (src/i18n/).
const SECCIONES: { id: Seccion; href: string }[] = [
  { id: "verificar", href: "/" },
  { id: "juego", href: "/juego" },
];

// Cabecera común: icono y nombre de ficha.json, la frase en el idioma elegido y el menú de secciones.
export function Cabecera({ activa, idioma = "es" }: { activa: Seccion; idioma?: Idioma }) {
  const t = diccionario(idioma);
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-24 max-w-5xl flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-4 md:px-8">
        {/* Icono y nombre de ficha.json: sin logotipos de la Administración. */}
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
            <span className="text-base text-(--text-secondary)">{t.cabecera.frase}</span>
          </span>
        </span>
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
