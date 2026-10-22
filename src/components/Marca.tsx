import type { SVGProps } from "react";

// Marca de Everdá: la «E» de Geist Black, la misma familia que el nombre en su
// peso más grueso, en blanco sobre la caja roja de Sol. Es el `icono` de
// ficha.json dibujado. src/app/icon.svg (el favicon) no puede leer CSS y
// repite este dibujo con los colores escritos; icon.test.ts comprueba que
// sigan siendo el mismo.
export const MARCA = {
  caracter: "E",
  // La letra centrada en una caja de 64 × 64.
  letra: "M44.28 48.33H19.72V15.67H43.91V22.89H28.73V28.37H43.36V35.54H28.73V41.11H44.28Z",
} as const;

// El «¿» que abre la pregunta de un titular, en el rojo de la marca. Si el
// titular no empieza por «¿» (catalán, euskera…), sale tal cual.
export function Pregunta({ children }: { children: string }) {
  if (!children.startsWith("¿")) return children;
  return (
    <>
      <span className="text-brand">¿</span>
      {children.slice(1)}
    </>
  );
}

// Decorativa: siempre va junto al nombre, que es lo que se lee.
export function Marca(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...props}>
      <rect width="64" height="64" rx="16" className="fill-brand" />
      <path d={MARCA.letra} className="fill-background" />
    </svg>
  );
}
