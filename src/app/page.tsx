import { AnalizarMensaje } from "@/components/AnalizarMensaje";
import { ModoEmergencia } from "@/components/ModoEmergencia";
import { Cabecera } from "@/components/Cabecera";
import { Pregunta } from "@/components/Marca";
import { Pie } from "@/components/Pie";
import { cn } from "@/lib/utils";
import { mostrarCasosTest } from "@/lib/casos-test";
import { diccionario, langHtml } from "@/i18n";
import { idiomaDePeticion } from "@/i18n/servidor";
import { IdiomaDocumento } from "@/components/IdiomaDocumento";

// El panel de ejemplos (para demos y pruebas) solo sale con ?casos-test=true;
// sin él, el verificador ocupa todo el ancho.
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
  const idioma = await idiomaDePeticion();
  const t = diccionario(idioma);

  return (
    <>
      <IdiomaDocumento lang={langHtml(idioma)} />
      <Cabecera activa="verificar" idioma={idioma} />

      <main
        id="contenido"
        tabIndex={-1}
        className={cn(
          "mx-auto px-(--page-gutter) pt-12 pb-20 outline-none md:px-8 md:pt-16",
          conEjemplos ? "max-w-5xl" : "max-w-[58rem]",
        )}
      >
        {/* Sin antetítulo: el titular abre la página. Su «¿», en el rojo de la marca. */}
        <h1 className="max-w-[760px] font-heading text-[clamp(34px,calc(4.5vw_-_2px),58px)] leading-[1.1] tracking-[-0.02em]">
          <Pregunta>{t.pagina.titulo}</Pregunta>
        </h1>
        <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-brand" />

        <div className="mt-6">
          <AnalizarMensaje
            conEjemplos={conEjemplos}
            idioma={idioma}
          />
        </div>

        <section aria-labelledby="emergencia-titulo" className="mt-12 border-t border-border pt-10">
          <p id="emergencia-titulo" className="sr-only">{t.emergencia.seccion}</p>
          <ModoEmergencia idioma={idioma} />
        </section>
      </main>

      <Pie idioma={idioma} />
    </>
  );
}
