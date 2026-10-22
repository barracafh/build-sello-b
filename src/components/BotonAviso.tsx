import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { cn } from "@/lib/utils";

type BotonAvisoProps = {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function BotonAviso({ className, variant = "sunset" }: BotonAvisoProps) {
  return (
    <a
      href={site.feedbackUrl}
      className={cn(buttonVariants({ variant, size: "lg" }), className)}
    >
      ¿Algo está mal? Avísanos
    </a>
  );
}
