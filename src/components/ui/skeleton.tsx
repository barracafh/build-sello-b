import { cn } from "cn";

// Pulso suave, sin destellos; con movimiento reducido queda fijo.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
