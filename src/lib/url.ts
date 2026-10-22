// Lógica pura de URLs. Nunca abre, sigue ni expande lo que analiza.
import { parse } from "tldts";

const PATRON_URL = /(?:https?|hxxps?):\/\/[^\s<>"']+/i;
const PUNTUACION_FINAL = /[.,;:!?)}»”]+$/;
const INICIO_RUIDO = /^[([{<"'«“]+/;
const PATRON_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export type Enlace = { crudo: string; conEsquema: boolean };

// Deshace el neutralizado habitual: `[.]`, `(.)` y `hxxp`.
export function desneutralizar(texto: string): string {
  return texto.replace(/\[\.\]|\(\.\)|\[dot\]/gi, ".").replace(/^hxxp/i, "http");
}

const pareceDominio = (candidato: string) => {
  const r = parse(candidato);
  return Boolean(r.domain) && r.isIcann === true;
};

// Un dominio sin esquema solo cuenta si su sufijo está en la PSL (así
// `hola.que` no es una URL) y un texto antes de la arroba solo si es otro dominio (así
// una dirección de correo no se toma por unas credenciales).
function esDominioSinEsquema(token: string): boolean {
  const limpio = desneutralizar(token);
  if (PATRON_IPV4.test(limpio.split(/[/?#:]/)[0])) return true;
  let url: URL;
  try {
    url = new URL(`http://${limpio}`);
  } catch {
    return false;
  }
  if (url.username && !pareceDominio(url.username)) return false;
  return pareceDominio(url.hostname.replace(/\.$/, ""));
}

function primerDominioSinEsquema(texto: string, hasta: number) {
  for (const m of texto.matchAll(/\S+/g)) {
    if (m.index >= hasta) break;
    const crudo = m[0].replace(INICIO_RUIDO, "").replace(PUNTUACION_FINAL, "");
    if (crudo.includes(".") && esDominioSinEsquema(crudo)) {
      return { crudo, indice: m.index };
    }
  }
  return null;
}

export function extraerEnlace(texto: string): Enlace | null {
  const conEsquema = PATRON_URL.exec(texto);
  const sin = primerDominioSinEsquema(texto, conEsquema?.index ?? Infinity);
  if (sin) return { crudo: sin.crudo, conEsquema: false };
  if (!conEsquema) return null;
  return {
    crudo: conEsquema[0].replace(PUNTUACION_FINAL, ""),
    conEsquema: true,
  };
}

// Esquema mal escrito (`htps://`, `http//`, `http:/`, `https:// x`) seguido de algo
// con punto: es un intento de enlace que ningún navegador abriría tal cual.
const PATRON_ESQUEMA_ROTO =
  /\b(h?[tx]{1,3}p{1,2}s?)(\s*[:;]\s*\/?\s*\/?\s*|\s*\/\s*\/?\s*)([^\s<>"']*[.,][a-z]{2}[^\s<>"']*)/gi;
const ESQUEMA_BIEN = /^(?:https?|hxxps?):\/\/$/i;

// Un enlace mal formado: esquema roto o `www.` sin un dominio que exista. Un
// enlace así no sale de ninguna web oficial, así que se trata como fraude.
export function extraerEnlaceNoValido(texto: string): string | null {
  for (const m of texto.matchAll(PATRON_ESQUEMA_ROTO)) {
    if (!ESQUEMA_BIEN.test(`${m[1]}${m[2]}`)) {
      return m[0].replace(INICIO_RUIDO, "").replace(PUNTUACION_FINAL, "");
    }
  }
  for (const m of texto.matchAll(/\S+/g)) {
    const crudo = m[0].replace(INICIO_RUIDO, "").replace(PUNTUACION_FINAL, "");
    if (/^www[.,]/i.test(crudo) && !esDominioSinEsquema(crudo)) return crudo;
  }
  return null;
}

// Un host válido: etiquetas LDH no vacías y un sufijo que existe en la PSL.
export function hostValido(host: string): boolean {
  const nombre = host.replace(/\.$/, "").toLowerCase();
  const partes = nombre.split(".");
  if (partes.length < 2) return false;
  if (!partes.every((p) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(p))) return false;
  const r = parse(nombre, { allowPrivateDomains: true });
  return Boolean(r.domain) && (r.isIcann === true || r.isPrivate === true);
}

export function extraerPrimeraUrl(texto: string): string | null {
  return extraerEnlace(texto)?.crudo ?? null;
}

// Idempotente: acepta http(s):// y hxxp(s):// y no duplica `[.]`.
export function neutralizar(url: string): string {
  return url
    .replace(/^http(s?):\/\//i, "hxxp$1://")
    .replace(/\[\.\]/g, ".")
    .replace(/\./g, "[.]");
}
