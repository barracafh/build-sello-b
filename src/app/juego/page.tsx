import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { JuegoEstafas } from "@/components/JuegoEstafas";
import { Pregunta } from "@/components/Marca";
import { Pie } from "@/components/Pie";
import ficha from "../../../ficha.json";
import { idiomaDePeticion } from "@/i18n/servidor";
import { diccionario, langHtml } from "@/i18n";
import { IdiomaDocumento } from "@/components/IdiomaDocumento";

export async function generateMetadata(): Promise<Metadata> {
  const t = diccionario(await idiomaDePeticion());
  return { title: `${t.cabecera.menu.juego.nombre} · ${ficha.nombre}` };
}

export default async function Juego() {
  const idioma = await idiomaDePeticion();
  const t = diccionario(idioma);
  return (
    <>
      <IdiomaDocumento lang={langHtml(idioma)} />
      <Cabecera activa="juego" idioma={idioma} />

      {/* Recorta a lo ancho de la página: la tarjeta sale volando sin scroll horizontal. */}
      <div className="overflow-x-clip">
        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto max-w-[44rem] px-(--page-gutter) pt-8 pb-20 outline-none md:px-8 md:pt-16"
        >
          <p className="font-mono text-sm tracking-[0.06em] text-(--text-secondary) uppercase">
            {t.juego.antetitulo}
          </p>
          {/* El mismo titular que la portada: tamaño y «¿» en el rojo de la marca. */}
          <h1 className="mt-4 font-heading text-[clamp(34px,calc(4.5vw_-_2px),58px)] leading-[1.1] tracking-[-0.02em]">
            <Pregunta>{t.juego.titulo}</Pregunta>
          </h1>
          <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-brand" />
          <p className="mt-6 text-lg text-(--text-secondary)">
            {t.juego.intro}
          </p>

          <div className="mt-8 md:mt-10">
            <JuegoEstafas idioma={idioma} />
          </div>
        </main>
      </div>

      <Pie idioma={idioma} />
    </>
  );
}
