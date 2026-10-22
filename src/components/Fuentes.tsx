export type Source = { nombre: string; url: string };

const sinProtocolo = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function Fuentes({ fuentes }: { fuentes: readonly Source[] }) {
  return (
    <aside aria-label="Fuentes oficiales" className="text-base">
      <h3 className="text-xl font-semibold">
        Fuentes oficiales
      </h3>
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
    </aside>
  );
}
