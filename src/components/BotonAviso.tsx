import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { diccionario, type Idioma } from "@/i18n";

export function BotonAviso({ idioma = "es" }: { idioma?: Idioma }) {
  return (
    <a
      href={site.feedbackUrl}
      className={buttonVariants({ variant: "sunset", size: "lg" })}
    >
      {diccionario(idioma).botonAviso}
    </a>
  );
}
