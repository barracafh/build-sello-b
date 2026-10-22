// Juego «¿Estafa o no?»: los 10 casos de datos/mensajes-ejemplo.json como
// tarjetas. Los F son fraudes publicados por INCIBE; los L, avisos legítimos.
// Aquí solo va lo que no cambia con el idioma (id, respuesta, direcciones): el
// texto y las pistas de cada caso están en src/i18n/, en `juego.casos`.
import { neutralizar } from "@/lib/url";
import { webOficial } from "@/lib/veredicto";
import type { Diccionario } from "@/i18n";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Caso = (typeof ejemplos)[number] & {
  url_prueba_sintetica?: string | null;
  url?: string;
  entidad?: string | null;
};

export type IdCaso = keyof Diccionario["juego"]["casos"];
export type Tipo = keyof Diccionario["juego"]["tipos"];

export type Ronda = {
  id: IdCaso;
  tipo: Tipo;
  /** Neutralizada: se enseña como texto, nunca como enlace. */
  direccion: string | null;
  esEstafa: boolean;
  web: { href: string; direccion: string } | null;
  fuente: { url: string; entidad: string | null };
};

const TIPOS: readonly string[] = ["sms", "email", "web"] satisfies Tipo[];

export const RONDAS: readonly Ronda[] = (ejemplos as Caso[]).map((caso) => {
  const url = caso.url_prueba_sintetica ?? caso.url ?? null;
  return {
    id: caso.id as IdCaso,
    tipo: (TIPOS.includes(caso.tipo) ? caso.tipo : "sms") as Tipo,
    direccion: url && neutralizar(url),
    esEstafa: caso.esperado === "no_oficial",
    web: webOficial(caso.web_oficial_correcta),
    fuente: { url: caso.fuente, entidad: caso.entidad ?? null },
  };
});

// Los avisos de INCIBE se distinguen por el caso: si no, en la lista final
// saldrían cinco «Aviso de INCIBE» iguales.
export function fuenteDe(ronda: Ronda, t: Diccionario) {
  const nombre = new URL(ronda.fuente.url).hostname.endsWith("incibe.es")
    ? `INCIBE · ${t.ejemplos[ronda.id]}`
    : (ronda.fuente.entidad ?? t.juego.webOficial);
  return { nombre, url: ronda.fuente.url };
}

/** Fisher-Yates; `azar` se puede fijar en los tests. */
export function barajar<T>(lista: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Cuánto hay que arrastrar la tarjeta (px) para que cuente como respuesta. */
export const UMBRAL_DESLIZAR = 110;

/** Respuesta a partir del arrastre: null si no llega al umbral. */
export const respuestaDeArrastre = (dx: number): boolean | null =>
  dx <= -UMBRAL_DESLIZAR ? true : dx >= UMBRAL_DESLIZAR ? false : null;

/** Qué frase final toca según los aciertos (el texto, en `juego.valoracion`). */
export function valoracion(
  aciertos: number,
  total: number,
): keyof Diccionario["juego"]["valoracion"] {
  if (aciertos === total) return "perfecto";
  if (aciertos >= total - 2) return "muyBien";
  if (aciertos >= total / 2) return "noEstaMal";
  return "repasa";
}
