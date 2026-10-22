import { mesDe, type Desmentido } from "@/lib/veredicto";
import { diccionario, type Idioma } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Desplegable } from "@/components/Desplegable";

// Señal de apoyo: enlaza los desmentidos, nunca la dirección analizada. Cerrado,
// con el número a la vista: es contexto, no lo que hay que hacer.
export function Desmentidos({
  id,
  veredicto,
  desmentidos,
  idioma = "es",
}: {
  id: string;
  veredicto: string;
  desmentidos: Desmentido[];
  idioma?: Idioma;
}) {
  const t = diccionario(idioma);
  const a = t.analizar;
  return (
    <Card
      render={<section aria-labelledby={id} />}
      className="gap-0 px-6 py-4 text-lg md:px-8"
    >
      <Desplegable
        resumen={
          <h3 id={id} className="text-xl font-semibold">
            {a.desmentidos} ({desmentidos.length})
          </h3>
        }
      >
        <p className="mt-2 text-base text-(--text-secondary)">
          {a.desmentidosTexto}
          {veredicto !== "no_oficial" && ` ${a.desmentidosNoPrueba}`}
        </p>
        <ul className="mt-3 grid gap-2 pb-2">
          {desmentidos.map((d) => (
            <li key={d.url}>
              <a
                href={d.url}
                className="flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-2 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <span className="block font-medium">{d.editor}</span>
                  <span className="block text-base text-(--text-secondary)">
                    «{d.calificacion}»
                    {mesDe(d.fecha, t.mes) && ` · ${mesDe(d.fecha, t.mes)}`}
                  </span>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </Desplegable>
    </Card>
  );
}
