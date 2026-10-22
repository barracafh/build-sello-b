import { LoaderCircle } from "lucide-react";
import { cn } from "cn";

// Con movimiento reducido no gira: queda como indicador estático.
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderCircle
      data-slot="spinner"
      aria-hidden="true"
      className={cn("size-5 animate-spin motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Spinner };
