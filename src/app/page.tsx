import { Badge } from "@/components/ui/badge";
import { AnalizarMensaje } from "@/components/AnalizarMensaje";
import { ModoEmergencia } from "@/components/ModoEmergencia";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { cn } from "@/lib/utils";
import { mostrarCasosTest } from "@/lib/casos-test";
import { avisosIncibe, linea017 } from "@/datos/incibe";
import { ExternalLink, Phone } from "lucide-react";
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

// El panel de ejemplos (para demos y pruebas) se enseña por defecto; con
// ?casos-test=false o =0 se oculta y el verificador ocupa todo el ancho.
// TODO(prod): antes de producción, volver a ocultarlo por defecto.
// Anchos del portal Import@ss (evidencia en docs/evidencias/ancho-importass.md):
// header y pie a 1024 px (max-w-5xl = 64rem, como .ss-header y .ss-wrapper) y el
// contenido a 58rem con 2rem de margen, como .ss-content. Con el panel de
// ejemplos el contenido usa los 1024 px para que quepan las dos columnas.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const conEjemplos = mostrarCasosTest((await searchParams)["casos-test"]);

  return (
    <>
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
          <Badge variant="outline">
            {ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}
          </Badge>
        </div>
      </header>

      <main
        id="contenido"
        tabIndex={-1}
        className={cn(
          "mx-auto px-(--page-gutter) pt-12 pb-20 outline-none md:px-8 md:pt-16",
          conEjemplos ? "max-w-5xl" : "max-w-[58rem]",
        )}
      >
        <p className="font-mono text-sm tracking-[0.06em] text-(--text-secondary) uppercase">
          Verificador de mensajes
        </p>
        <h1 className="mt-4 max-w-[760px] font-heading text-[clamp(36px,4.5vw,60px)] leading-[1.1] tracking-[-0.02em]">
          ¿Este mensaje es de verdad?
        </h1>
        <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-brand" />

        <div className="mt-6">
          <AnalizarMensaje
            conEjemplos={conEjemplos}
            intro={
              <p className="max-w-[760px] text-(--text-secondary)">
                Pega un SMS, un correo o una web que dice ser de la DGT,
                Hacienda u otro organismo y te decimos si podemos confirmarlo.
              </p>
            }
          />
        </div>

        <section aria-labelledby="emergencia-titulo" className="mt-12 border-t border-border pt-10">
          <p id="emergencia-titulo" className="sr-only">Si ya has actuado</p>
          <ModoEmergencia />
        </section>
      </main>

      {/* Pie con la maqueta del equipo (estilo portal de la Administración), pero
          con la marca de ficha.json: sin escudos ni logotipos oficiales. */}
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
            <ul className="flex flex-wrap items-center gap-y-2 text-(--text-secondary) [&>li+li]:border-l [&>li+li]:border-border [&>li+li]:pl-4 [&>li]:pr-4">
              <li>
                Squad <span className="font-mono">{ficha.equipo}</span>
              </li>
              <li>Build night BARRACA x SOTI</li>
              <li>{ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}</li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
