import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { cn } from "@/lib/utils";
import { diccionario, type Idioma } from "@/i18n";

type BotonAvisoProps = {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  idioma?: Idioma;
};

export function BotonAviso({ className, variant = "sunset", idioma = "es" }: BotonAvisoProps) {
  return (
    <a
      href={site.feedbackUrl}
      className={cn(buttonVariants({ variant, size: "lg" }), className)}
    >
      {diccionario(idioma).botonAviso}
    </a>
  );
}
