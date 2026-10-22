// El mensaje del ciudadano partido en trozos, con las trampas señaladas (LAB-62).
// Puro y sin dependencias de servidor: lo usa también el navegador. Ninguna URL
// sale viva: cada trozo se devuelve con sus direcciones neutralizadas.
import { neutralizar } from "./url";

export type Nivel = "roja" | "naranja";
/** Rango [inicio, fin) del texto original que se subraya con el color de su señal. */
export type Fragmento = { inicio: number; fin: number; nivel: Nivel; codigo: string };
export type Trozo = { texto: string; nivel: Nivel | null; codigo: string | null };

// Una dirección con esquema, o un dominio sin él (con puntos o `[.]`), y su ruta.
const SEPARADOR = String.raw`(?:\.|\[\.\]|\(\.\)|\[dot\])`;
const DIRECCION = new RegExp(
  String.raw`(?:https?|hxxps?):\/\/[^\s<>"']+|(?<![\p{L}\d-])(?:[\p{L}\d-]+${SEPARADOR})+\p{L}{2,}(?![\p{L}\d-])(?:\/[^\s<>"']*)?`,
  "giu",
);
const PUNTUACION_FINAL = /[.,;:!?)}»”]+$/;

/** Dónde hay una URL o un dominio en el texto, sin la puntuación final. */
export function rangosDeUrl(texto: string): { inicio: number; fin: number }[] {
  return [...texto.matchAll(DIRECCION)].map((m) => ({
    inicio: m.index,
    fin: m.index + m[0].replace(PUNTUACION_FINAL, "").length,
  }));
}

/** Neutraliza cada URL o dominio de un texto (hxxps, [.]); el resto queda igual. */
export const neutralizarTexto = (texto: string) =>
  texto.replace(DIRECCION, (u) => {
    const limpia = u.replace(PUNTUACION_FINAL, "");
    return neutralizar(limpia) + u.slice(limpia.length);
  });

const esFragmento = (f: unknown, longitud: number): f is Fragmento => {
  const x = f as Record<string, unknown> | null;
  return (
    Number.isInteger(x?.inicio) &&
    Number.isInteger(x?.fin) &&
    (x!.inicio as number) >= 0 &&
    (x!.fin as number) <= longitud &&
    (x!.inicio as number) < (x!.fin as number) &&
    (x!.nivel === "roja" || x!.nivel === "naranja") &&
    typeof x!.codigo === "string"
  );
};

/** Lee los fragmentos de la API sin fiarse de su forma: solo rangos dentro del texto. */
export const leerFragmentos = (datos: unknown, longitud = Infinity): Fragmento[] =>
  Array.isArray(datos) ? datos.filter((f): f is Fragmento => esFragmento(f, longitud)) : [];

/** Parte el texto en trozos neutralizados; los rangos solapados o fuera del texto se ignoran. */
export function trozos(texto: string, fragmentos: Fragmento[]): Trozo[] {
  const salida: Trozo[] = [];
  const poner = (desde: number, hasta: number, f: Fragmento | null) => {
    if (hasta <= desde) return;
    salida.push({
      texto: neutralizarTexto(texto.slice(desde, hasta)),
      nivel: f?.nivel ?? null,
      codigo: f?.codigo ?? null,
    });
  };
  let cursor = 0;
  const validos = leerFragmentos(fragmentos, texto.length).sort((a, b) => a.inicio - b.inicio);
  for (const f of validos) {
    if (f.inicio < cursor) continue;
    poner(cursor, f.inicio, null);
    poner(f.inicio, f.fin, f);
    cursor = f.fin;
  }
  poner(cursor, texto.length, null);
  return salida;
}
