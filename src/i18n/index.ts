// i18n ligero: un diccionario tipado por idioma, sin framework. El idioma sale
// de ?lang, luego de Accept-Language y si no, castellano (resolverIdioma).
// src/proxy.ts lo resuelve en cada petición y lo pasa en CABECERA_IDIOMA.
import { ca } from "./ca";
import { es, type Diccionario } from "./es";
import { eu } from "./eu";
import { gl } from "./gl";
import { va } from "./va";

export type { Diccionario };

export const IDIOMAS = ["es", "ca", "va", "gl", "eu"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_POR_DEFECTO: Idioma = "es";

// Cabecera interna que pone src/proxy.ts; el proxy pisa la que mande el navegador.
export const CABECERA_IDIOMA = "x-sello-idioma";

// Cada idioma escrito en sí mismo, para el selector.
export const NOMBRES: Record<Idioma, string> = {
  es: "Castellano",
  ca: "Català",
  va: "Valencià",
  gl: "Galego",
  eu: "Euskara",
};

export const DICCIONARIOS: Record<Idioma, Diccionario> = { es, ca, va, gl, eu };

export const esIdioma = (valor: unknown): valor is Idioma =>
  typeof valor === "string" && (IDIOMAS as readonly string[]).includes(valor);

export const diccionario = (idioma: Idioma): Diccionario => DICCIONARIOS[idioma];

// Etiqueta BCP 47 para <html lang>: valencià es ca-ES-valencia.
export const langHtml = (idioma: Idioma) => (idioma === "va" ? "ca-ES-valencia" : idioma);

// Una etiqueta de Accept-Language (es-ES, ca-ES-valencia, eu…) a uno de los cinco.
const deEtiqueta = (etiqueta: string): Idioma | null => {
  const partes = etiqueta.toLowerCase().split("-");
  if (partes[0] === "ca" && partes.includes("valencia")) return "va";
  return esIdioma(partes[0]) ? partes[0] : null;
};

const deAcceptLanguage = (cabecera: string): Idioma | null => {
  const preferidos = cabecera
    .split(",")
    .map((trozo, orden) => {
      const [etiqueta, ...params] = trozo.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const peso = q ? Number(q.slice(2)) : 1;
      return { etiqueta: etiqueta.trim(), peso: Number.isFinite(peso) ? peso : 0, orden };
    })
    .filter((p) => p.etiqueta && p.peso > 0)
    .sort((a, b) => b.peso - a.peso || a.orden - b.orden);
  for (const { etiqueta } of preferidos) {
    const idioma = deEtiqueta(etiqueta);
    if (idioma) return idioma;
  }
  return null;
};

// ?lang manda; si falta o no es uno de los cinco, Accept-Language; si no, es.
export function resolverIdioma(
  lang: string | string[] | null | undefined,
  acceptLanguage: string | null | undefined,
): Idioma {
  const pedido = (Array.isArray(lang) ? lang[0] : lang)?.toLowerCase();
  if (esIdioma(pedido)) return pedido;
  return (acceptLanguage && deAcceptLanguage(acceptLanguage)) || IDIOMA_POR_DEFECTO;
}
