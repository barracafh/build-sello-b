import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BotonAviso } from "@/components/BotonAviso";
import { Fuentes } from "@/components/Fuentes";
import ficha from "../../ficha.json";

// Ejemplo de respuesta compuesta con Sol. Sustitúyelo por vuestra herramienta y
// conserva las piezas: pasos, tarjetas, dónde se hace y fuentes.
const pasos = [
  "Responde a lo que se pregunta, en pocas frases y con pasos.",
  "Cita la página oficial que sostiene cada respuesta.",
  "Si no puede confirmarlo, lo dice y enlaza la sede oficial.",
];
const sede = ficha.fuentes[0];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex min-h-20 max-w-(--container-content) flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-4">
        <span className="inline-flex items-center gap-3 text-lg leading-tight font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand font-mono text-xl text-white"
          >
            {ficha.icono}
          </span>
          {ficha.nombre}
        </span>
        <Badge variant="outline">
          {ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}
        </Badge>
      </header>

      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto max-w-[760px] px-(--page-gutter) pt-12 pb-20 outline-none md:pt-20"
      >
        <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
          Página de ejemplo
        </p>
        <h1 className="mt-4 text-[clamp(36px,4.5vw,60px)] leading-[1.1] tracking-[-0.02em]">
          Tu siguiente paso, con su fuente.
        </h1>
        <p className="mt-6 text-lg text-(--text-secondary)">
          Elige un caso pequeño y resuélvelo de principio a fin. Así se compone
          una respuesta en esta plataforma.
        </p>

        <section
          aria-labelledby="pregunta"
          className="mt-16 text-lg [&>*+*]:mt-8"
        >
          <div>
            <h2
              id="pregunta"
              className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
            >
              ¿Cómo responde esta herramienta?
            </h2>
            <p className="mt-3 text-[15px] text-(--text-secondary)">
              Respuesta de ejemplo con {ficha.fuentes.length}{" "}
              {ficha.fuentes.length === 1
                ? "fuente oficial"
                : "fuentes oficiales"}
            </p>
          </div>

          <ol className="grid gap-5">
            {pasos.map((paso, i) => (
              <li
                key={paso}
                className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
              >
                <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                  {i + 1}
                </span>
                <p>{paso}</p>
              </li>
            ))}
          </ol>

          {/* Una sola tarjeta con el sol por vista: la del dato que más importa. */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
            <Card
              render={<section />}
              className="gap-2 bg-muted px-6 py-6 text-base ring-0"
            >
              <h3 className="text-sm font-medium text-(--text-secondary)">
                Requisitos
              </h3>
              <p>Solo los que diga la fuente oficial.</p>
            </Card>
            <Card
              render={<section />}
              className="gap-2 px-6 py-6 text-base ring-0 [background:radial-gradient(120%_90%_at_100%_0%,#ffd34d_0%,rgba(255,211,77,0)_60%),var(--brand-yellow)]"
            >
              <h3 className="text-sm font-medium">Plazo</h3>
              <p>Con su fecha y la publicación que lo fija.</p>
            </Card>
            <Card
              render={<section />}
              className="gap-2 bg-muted px-6 py-6 text-base ring-0"
            >
              <h3 className="text-sm font-medium text-(--text-secondary)">
                Coste
              </h3>
              <p>La cifra tal como la publica el organismo.</p>
            </Card>
          </div>

          <Card
            render={<section />}
            className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 text-base"
          >
            <div className="min-w-0 flex-[1_1_260px]">
              <p className="text-sm text-(--text-secondary)">Dónde se hace</p>
              <h3 className="mt-1 text-lg leading-[1.35] font-medium">
                En la sede oficial del organismo
              </h3>
              <p className="mt-1 font-mono text-sm text-(--text-secondary)">
                {new URL(sede.url).hostname}
              </p>
            </div>
            <a
              href={sede.url}
              className={cn(
                buttonVariants({ variant: "sunset", size: "lg" }),
                "max-md:w-full",
              )}
            >
              Abrir la web oficial <span aria-hidden="true">↗</span>
            </a>
          </Card>

          <Fuentes fuentes={ficha.fuentes} />
        </section>
      </main>

      <footer className="p-2">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] px-(--page-gutter) py-12 [background:radial-gradient(80%_70%_at_50%_-12%,#ffe58f_0%,rgba(255,229,143,0)_70%),linear-gradient(180deg,#ffd34d_0%,var(--brand-yellow)_46%,var(--brand-orange)_100%)] md:px-12">
          <p className="text-[15px]">
            Una pieza del squad{" "}
            <span className="font-mono">{ficha.equipo}</span> · Build night
          </p>
          <BotonAviso />
        </div>
      </footer>
    </>
  );
}
