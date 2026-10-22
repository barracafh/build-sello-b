import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { JuegoEstafas } from "@/components/JuegoEstafas";
import { Pie } from "@/components/Pie";
import ficha from "../../../ficha.json";
import { idiomaDePeticion } from "@/i18n/servidor";

export const metadata: Metadata = {
  title: `Juego: ¿estafa o no? · ${ficha.nombre}`,
};

// La cabecera y el pie siguen el idioma elegido; el juego aún es solo en castellano (LAB-70).
export default async function Juego() {
  const idioma = await idiomaDePeticion();
  return (
    <>
      <Cabecera activa="juego" idioma={idioma} />

      {/* Recorta a lo ancho de la página: la tarjeta sale volando sin scroll horizontal. */}
      <div className="overflow-x-clip">
        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto max-w-[44rem] px-(--page-gutter) pt-8 pb-20 outline-none md:px-8 md:pt-16"
        >
          <p className="font-mono text-sm tracking-[0.06em] text-(--text-secondary) uppercase">
            Juego · 10 mensajes
          </p>
          <h1 className="mt-4 font-heading text-[clamp(36px,4.5vw,60px)] leading-[1.1] tracking-[-0.02em]">
            ¿Estafa o no?
          </h1>
          <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-brand" />
          <p className="mt-6 text-lg text-(--text-secondary)">
            Cinco estafas reales avisadas por INCIBE y cinco avisos de verdad.
            Desliza a la izquierda si es una estafa y a la derecha si es de verdad.
          </p>

          <div className="mt-8 md:mt-10">
            <JuegoEstafas />
          </div>
        </main>
      </div>

      <Pie idioma={idioma} />
    </>
  );
}
