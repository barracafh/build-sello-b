import { cn } from "@/lib/utils";
import { trozos, type Fragmento, type Nivel } from "@/lib/trozos";
import { diccionario, type Idioma } from "@/i18n";

// El mensaje tal como lo pegó la persona, con cada trampa subrayada en el color
// de su señal (LAB-62). Solo nodos de texto: nada de HTML del mensaje, y cada
// URL o dominio sale neutralizado y sin enlace. El texto no sale del navegador.
const MARCA: Record<Nivel, string> = {
  roja: "bg-destructive/10 text-foreground decoration-destructive decoration-solid",
  naranja: "bg-(--warning) text-(--warning-foreground) decoration-(--warning-foreground) decoration-dashed",
};
const BASE_MARCA = "rounded-sm px-0.5 underline decoration-2 underline-offset-4 box-decoration-clone";

export function MensajeSenalado({
  texto,
  fragmentos,
  id,
  idioma = "es",
}: {
  texto: string;
  fragmentos: Fragmento[];
  id: string;
  idioma?: Idioma;
}) {
  const t = diccionario(idioma).senalado;
  const partes = trozos(texto, fragmentos);
  if (!partes.some((p) => p.nivel)) return null;
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="text-xl font-semibold">
        {t.titulo}
      </h3>
      <p className="mt-2 text-base text-(--text-secondary)">
        <mark className={cn(BASE_MARCA, MARCA.roja)}>{t.continuo}</mark>: {t.roja}.{" "}
        <mark className={cn(BASE_MARCA, MARCA.naranja)}>{t.trazos}</mark>: {t.naranja}.
      </p>
      <p className="mt-3 rounded-lg px-4 py-3 whitespace-pre-wrap ring-1 ring-foreground/10 [overflow-wrap:anywhere]">
        {partes.map((p, i) =>
          p.nivel ? (
            <span key={i}>
              <span className="sr-only">{t[p.nivel]}: </span>
              <mark className={cn(BASE_MARCA, MARCA[p.nivel])}>{p.texto}</mark>
            </span>
          ) : (
            <span key={i}>{p.texto}</span>
          ),
        )}
      </p>
    </section>
  );
}
