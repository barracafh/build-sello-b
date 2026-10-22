import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lo que queda del formulario cuando hay resultado: una línea y el botón para
// volver a él con el mismo texto.
export function BarraComprobado({ onOtro }: { onOtro: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl bg-muted px-4 py-3 md:px-5">
      <p className="flex items-center gap-2 font-medium">
        <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
        Mensaje comprobado
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onOtro}
        className="h-12 px-5 text-lg max-sm:w-full"
      >
        Comprobar otro mensaje
      </Button>
    </div>
  );
}
