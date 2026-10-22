import { cn } from "@/lib/utils";
import { trozos, type Fragmento, type Nivel } from "@/lib/trozos";
import { Desplegable } from "@/components/Desplegable";

// El mensaje tal como lo pegó la persona, con cada trampa subrayada en el color
// de su señal (LAB-62). Solo nodos de texto: nada de HTML del mensaje, y cada
// URL o dominio sale neutralizado y sin enlace. El texto no sale del navegador.
const MARCA: Record<Nivel, string> = {
  roja: "bg-destructive/10 text-foreground decoration-destructive decoration-solid",
  naranja: "bg-(--warning) text-(--warning-foreground) decoration-(--warning-foreground) decoration-dashed",
};
const BASE_MARCA = "rounded-sm px-0.5 underline decoration-2 underline-offset-4 box-decoration-clone";

const ETIQUETA: Record<Nivel, string> = { roja: "señal roja", naranja: "señal naranja" };

export function MensajeSenalado({
  texto,
  fragmentos,
  id,
}: {
  texto: string;
  fragmentos: Fragmento[];
  id: string;
}) {
  const partes = trozos(texto, fragmentos);
  if (!partes.some((p) => p.nivel)) return null;
  return (
    // Abierto en escritorio, cerrado en el móvil: allí el veredicto va primero (LAB-69).
    <section aria-labelledby={id}>
      <Desplegable
        abiertoEnEscritorio
        resumen={
          <h3 id={id} className="text-xl font-semibold">
            Así se ve en tu mensaje
          </h3>
        }
      >
        <p className="mt-2 text-base text-(--text-secondary)">
          <mark className={cn(BASE_MARCA, MARCA.roja)}>Subrayado continuo</mark>: señal roja.{" "}
          <mark className={cn(BASE_MARCA, MARCA.naranja)}>Subrayado a trazos</mark>: señal naranja.
        </p>
        <p className="mt-3 rounded-lg px-4 py-3 whitespace-pre-wrap ring-1 ring-foreground/10 [overflow-wrap:anywhere]">
          {partes.map((p, i) =>
            p.nivel ? (
              <span key={i}>
                <span className="sr-only">{ETIQUETA[p.nivel]}: </span>
                <mark className={cn(BASE_MARCA, MARCA[p.nivel])}>{p.texto}</mark>
              </span>
            ) : (
              <span key={i}>{p.texto}</span>
            ),
          )}
        </p>
      </Desplegable>
    </section>
  );
}
