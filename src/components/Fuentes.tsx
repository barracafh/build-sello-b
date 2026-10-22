import { cn } from "@/lib/utils";
import { diccionario, type Idioma } from "@/i18n";

export type Source = { nombre: string; url: string };

const sinProtocolo = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function Lista({ fuentes }: { fuentes: readonly Source[] }) {
  return (
    <ul className="mt-4 divide-y overflow-hidden rounded-xl bg-background text-foreground ring-1 ring-foreground/10">
      {fuentes.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <span className="min-w-0 [overflow-wrap:anywhere]">
              <span className="block font-medium text-(--azul-importass)">{source.nombre}</span>
              {sinProtocolo(source.url) !== source.nombre && (
                <span className="block font-mono text-sm text-(--text-secondary)">
                  {sinProtocolo(source.url)}
                </span>
              )}
            </span>
            <span aria-hidden="true" className="text-(--azul-importass)">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

// Los verificadores (Maldita, Newtral…) van aparte: no son fuentes oficiales.
export function Fuentes({
  fuentes,
  verificadores = [],
  idioma = "es",
}: {
  fuentes: readonly Source[];
  verificadores?: readonly Source[];
  idioma?: Idioma;
}) {
  const t = diccionario(idioma).fuentes;
  return (
    // Con verificadores, en escritorio van al lado de las fuentes para no alargar la página.
    <aside
      aria-label={t.aria}
      className={cn("text-base", verificadores.length > 0 && "lg:grid lg:grid-cols-2 lg:gap-x-8")}
    >
      <div>
        <h3 className="text-xl font-semibold">
          {t.oficiales}
        </h3>
        <Lista fuentes={fuentes} />
      </div>
      {verificadores.length > 0 && (
        <div className="max-lg:mt-6">
          <h3 className="text-xl font-semibold">
            {t.verificadores}
          </h3>
          <Lista fuentes={verificadores} />
        </div>
      )}
    </aside>
  );
}
