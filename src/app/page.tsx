import { AnalizarMensaje } from "@/components/AnalizarMensaje";
import { ModoEmergencia } from "@/components/ModoEmergencia";
import { Cabecera } from "@/components/Cabecera";
import { Pie } from "@/components/Pie";
import { cn } from "@/lib/utils";
import { mostrarCasosTest } from "@/lib/casos-test";

// El panel de ejemplos (para demos y pruebas) solo sale con ?casos-test=true;
// sin él, el verificador ocupa todo el ancho.
// Anchos del portal Import@ss (evidencia en docs/evidencias/ancho-importass.md):
// header y pie a 1024 px (max-w-5xl = 64rem, como .ss-header y .ss-wrapper) y el
// contenido a 58rem con 2rem de margen, como .ss-content. Con el panel de
// ejemplos, o con un resultado, el contenido usa los 1024 px para que quepan
// las dos columnas.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const conEjemplos = mostrarCasosTest((await searchParams)["casos-test"]);

  return (
    <>
      <Cabecera activa="verificar" />

      <main
        id="contenido"
        tabIndex={-1}
        className={cn(
          "mx-auto px-(--page-gutter) pt-12 pb-20 outline-none md:px-8 md:pt-16",
          // Con un resultado se ensancha a 64rem para sus dos columnas (LAB-69).
          conEjemplos ? "max-w-5xl" : "max-w-[58rem] has-data-resultado:max-w-5xl",
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

      <Pie />
    </>
  );
}
