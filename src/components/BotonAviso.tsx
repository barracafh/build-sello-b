import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";

export function BotonAviso() {
  return (
    <a
      href={site.feedbackUrl}
      className={buttonVariants({ variant: "sunset", size: "lg" })}
    >
      ¿Algo está mal? Avísanos
    </a>
  );
}
