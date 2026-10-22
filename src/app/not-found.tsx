import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";

// La de Next sale en inglés y sin <main>, así que «Saltar al contenido» no
// llevaba a nada. El aviso y «Avísanos» (regla 5) viven en el pie de page.tsx,
// que aquí no se pinta: se repiten en un <aside> propio.
export default function NoEncontrada() {
  return (
    <>
      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto max-w-[58rem] px-(--page-gutter) pt-12 pb-20 outline-none md:px-8 md:pt-16"
      >
        <p className="font-mono text-sm tracking-[0.06em] text-(--text-secondary) uppercase">
          Error 404
        </p>
        <h1 className="mt-4 font-heading text-[clamp(36px,4.5vw,60px)] leading-[1.1] tracking-[-0.02em]">
          No encontramos esta página
        </h1>
        <p className="mt-6 text-lg text-(--text-secondary)">
          Puede que la dirección esté mal escrita o que la página ya no exista.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "sunset", size: "lg" }),
            "mt-8 h-14 px-6 text-lg max-sm:w-full",
          )}
        >
          Volver al verificador
        </Link>
      </main>

      <aside aria-label="Aviso" className="bg-muted text-base">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-8 md:px-8">
          <p className="text-(--text-secondary)">
            Herramienta experimental. No es un servicio oficial.
          </p>
          <a
            href={site.feedbackUrl}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-auto min-h-12 px-5 py-2 text-base whitespace-normal",
            )}
          >
            ¿Algo está mal? Avísanos
          </a>
        </div>
      </aside>
    </>
  );
}
