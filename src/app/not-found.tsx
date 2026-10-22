import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// La de Next sale en inglés y sin <main>, así que el enlace de salto no lleva a nada.
export default function NoEncontrada() {
  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto max-w-[760px] px-(--page-gutter) pt-12 pb-20 outline-none md:pt-20"
    >
      <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
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
          "mt-8 h-11 px-5 text-base max-sm:w-full",
        )}
      >
        Volver al verificador
      </Link>
    </main>
  );
}
