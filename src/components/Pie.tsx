import { ExternalLink, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { avisosIncibe, linea017 } from "@/datos/incibe";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";

// Columnas del pie: webs oficiales de datos/dominios-oficiales.json y la ayuda de INCIBE.
const columnasPie = [
  {
    id: "organismos",
    titulo: "Organismos oficiales",
    enlaces: [
      { nombre: "Agencia Tributaria", url: "https://sede.agenciatributaria.gob.es" },
      { nombre: "Seguridad Social", url: "https://sede.seg-social.gob.es" },
      { nombre: "Tráfico (DGT)", url: "https://sede.dgt.gob.es" },
      { nombre: "Correos", url: "https://www.correos.es" },
      { nombre: "INCIBE", url: "https://www.incibe.es" },
    ],
  },
  {
    id: "ayuda",
    titulo: "Información y ayuda",
    enlaces: [
      { nombre: "Llamar al 017", url: "tel:017" },
      { nombre: "Línea 017 de INCIBE", url: linea017.url },
      { nombre: "Avisos de INCIBE", url: avisosIncibe.url },
    ],
  },
];

const enlacePie =
  "inline-block py-2.5 text-(--azul-importass) underline underline-offset-4 hover:text-(--azul-importass-oscuro) hover:decoration-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--azul-importass-oscuro)";

// Pie común a todas las páginas. Lleva el aviso «Herramienta experimental. No
// es un servicio oficial.» y «¿Algo está mal? Avísanos» (regla 5). Maqueta
// del equipo (estilo portal de la Administración), pero con la marca de
// ficha.json: sin escudos ni logotipos oficiales.
export function Pie() {
  return (
    <footer className="mt-8 bg-muted text-base">
      <div className="mx-auto grid max-w-5xl gap-10 px-(--page-gutter) py-14 md:px-8 md:grid-cols-2 lg:grid-cols-[1fr_1.05fr_1.05fr_0.95fr] lg:gap-0">
        <div className="lg:pr-6">
          <span className="inline-flex items-center gap-4 border-l-4 border-brand-yellow pl-4">
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand font-mono text-2xl text-white" /* tema-ok: icono de la plantilla sobre brand */
            >
              {ficha.icono}
            </span>
            <span className="text-lg leading-tight font-semibold">
              {ficha.nombre}
            </span>
          </span>
          <p className="mt-6 max-w-[38ch] text-(--text-secondary)">
            {ficha.nombre} es una herramienta independiente para ayudarte a
            identificar posibles fraudes. Herramienta experimental. No es un
            servicio oficial.
          </p>
        </div>

        {columnasPie.map((columna) => (
          <nav
            key={columna.id}
            aria-labelledby={`pie-${columna.id}`}
            className="lg:border-l lg:border-border lg:px-6"
          >
            <h2 id={`pie-${columna.id}`} className="font-sans text-lg font-semibold">
              {columna.titulo}
            </h2>
            <ul className="mt-2">
              {columna.enlaces.map((enlace) => (
                <li key={enlace.url}>
                  <a href={enlace.url} className={enlacePie}>
                    {enlace.nombre}
                    {enlace.url.startsWith("tel:") ? (
                      <Phone aria-hidden="true" className="ml-1.5 inline size-4 align-[-0.125em]" />
                    ) : (
                      <ExternalLink aria-hidden="true" className="ml-1.5 inline size-4 align-[-0.125em]" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section aria-labelledby="pie-herramienta" className="lg:border-l lg:border-border lg:pl-6">
          <h2 id="pie-herramienta" className="font-sans text-lg font-semibold">
            Sobre la herramienta
          </h2>
          <p className="mt-3 text-(--text-secondary)">
            No guardamos lo que pegas ni abrimos sus enlaces.
          </p>
          <a
            href={site.feedbackUrl}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mt-4 h-auto min-h-12 px-5 py-2 text-base whitespace-normal",
            )}
          >
            ¿Algo está mal? Avísanos
          </a>
        </section>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-(--page-gutter) md:px-8 py-6">
          <span className="inline-flex items-center gap-3 font-semibold">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand font-mono text-lg text-white" /* tema-ok: icono de la plantilla sobre brand */
            >
              {ficha.icono}
            </span>
            {ficha.nombre}
          </span>
          {/* En el móvil, en columna y sin separadores: si no, las rayas quedan sueltas al partir la fila. */}
          <ul className="flex flex-col gap-y-2 text-(--text-secondary) sm:flex-row sm:flex-wrap sm:items-center sm:[&>li+li]:border-l sm:[&>li+li]:border-border sm:[&>li+li]:pl-4 sm:[&>li]:pr-4">
            <li>
              Squad <span className="font-mono">{ficha.equipo}</span>
            </li>
            <li>Build night BARRACA x SOTI</li>
            <li>{ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
