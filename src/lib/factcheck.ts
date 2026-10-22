// Desmentidos publicados (Google Fact Check Tools, `claims:search`). Solo en el
// servidor. La consulta se arma con un vocabulario fijo y el dominio registrable
// del enlace: nunca lleva el texto del ciudadano, así que no puede llevar nombres,
// teléfonos, correos, importes ni IBAN. No se guarda ni se registra nada.
import { parse } from "tldts";
import { desneutralizar } from "./url";
import type { Desmentido } from "./veredicto";
import type { Resultado } from "./verificar";

export type { Desmentido };

// `no_consultado`: sin clave, sin consulta, error o tiempo agotado.
export type Desmentidos = Desmentido[] | "no_consultado";

const L = String.raw`(?<![\p{L}\d])`;
const R = String.raw`(?![\p{L}\d])`;
const regla = (cuerpo: string) => new RegExp(`${L}(?:${cuerpo})${R}`, "iu");
const cerca = (a: string, b: string, n = 40) =>
  new RegExp(`${L}(?:${a})${R}[^.!?\\n]{0,${n}}${L}(?:${b})${R}`, "iu");

// Organismo suplantado: lo que se manda es la etiqueta, no lo que dice el texto.
const ORGANISMOS: [RegExp, string][] = [
  [regla(String.raw`aeat|agencia tributaria|agenciatributaria|hacienda`), "Agencia Tributaria"],
  [regla(String.raw`dgt|direcci[oó]n general de tr[aá]fico|tr[aá]fico`), "DGT"],
  [regla(String.raw`seguridad social|seg-social|tgss`), "Seguridad Social"],
  [regla(String.raw`sepe|servicio p[uú]blico de empleo`), "SEPE"],
  [regla(String.raw`correos`), "Correos"],
];

// Patrones de estafa. Un aviso legítimo («tiene una notificación», «su envío está
// en camino») no casa con ninguno, así que no se consulta.
const PATRONES: [RegExp, string][] = [
  [regla(String.raw`multas?`), "multa"],
  [regla(String.raw`devoluci[oó]n|reembolso`), "devolución"],
  [cerca(String.raw`paquete|env[ií]o`, String.raw`retenid[oa]`), "paquete retenido"],
  [regla(String.raw`aduanas?`), "aduana"],
  [regla(String.raw`tarjeta sanit[aà]ria`), "tarjeta sanitaria"],
  [regla(String.raw`embargo|embargar`), "embargo"],
];

/** Todas las palabras que puede llevar una consulta, además del dominio. */
export const VOCABULARIO = [
  ...new Set([...ORGANISMOS, ...PATRONES].flatMap(([, etiqueta]) => etiqueta.split(" "))),
];

// Motivos con los que el enlace es (o cita) una web oficial: ese dominio no es la estafa.
const ENLACE_OFICIAL = new Set(["en_allowlist", "web_oficial_citada"]);
const ACORTADO = "acortador_no_resuelto";

// Solo el registrable (sin subdominio, ruta ni parámetros, que pueden llevar
// identificadores) y sin tiradas de cifras que parezcan un teléfono o un DNI.
function dominioDe(resultado: Resultado): string | null {
  if (!resultado.url_analizada) return null;
  if (resultado.motivos.some((m) => ENLACE_OFICIAL.has(m) || m === ACORTADO)) return null;
  const dominio = parse(desneutralizar(resultado.url_analizada)).domain?.toLowerCase();
  if (!dominio || !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(dominio) || /\d{4}/.test(dominio)) {
    return null;
  }
  return dominio;
}

/**
 * La consulta para `claims:search`, o null si no hay que preguntar: con
 * `oficial_verificado`, o sin un patrón de estafa y algo con lo que acotarlo
 * (organismo o dominio).
 */
export function consultaDesmentido(texto: string, resultado: Resultado): string | null {
  if (resultado.veredicto === "oficial_verificado") return null;
  const donde = `${texto} ${resultado.entidad ?? ""}`;
  const organismo = ORGANISMOS.find(([patron]) => patron.test(donde))?.[1];
  const patrones = PATRONES.filter(([patron]) => patron.test(texto)).map(([, e]) => e);
  const dominio = dominioDe(resultado);
  if (patrones.length === 0 || (!organismo && !dominio)) return null;
  return [organismo, ...patrones, dominio].filter(Boolean).join(" ");
}

const API = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
const DIAS = 730;
const MAXIMO = 3;

type Opciones = {
  clave?: string;
  fetch?: typeof fetch;
  ahora?: Date;
  /** Milisegundos antes de cortar. */
  espera?: number;
};

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function leer(datos: unknown, desde: number): Desmentido[] {
  const claims = (datos as { claims?: unknown } | null)?.claims;
  if (!Array.isArray(claims)) return [];
  const fuera: Desmentido[] = [];
  for (const claim of claims) {
    const revisiones = (claim as { claimReview?: unknown })?.claimReview;
    if (!Array.isArray(revisiones)) continue;
    for (const r of revisiones as Record<string, unknown>[]) {
      const publisher = r?.publisher as Record<string, unknown> | undefined;
      const editor = texto(publisher?.name) ?? texto(publisher?.site);
      const url = texto(r?.url);
      const calificacion = texto(r?.textualRating);
      const fecha = texto(r?.reviewDate);
      if (!editor || !url || !calificacion) continue;
      try {
        if (new URL(url).protocol !== "https:") continue;
      } catch {
        continue;
      }
      if (fecha && !(Date.parse(fecha) >= desde)) continue;
      if (fuera.some((d) => d.url === url)) continue;
      fuera.push({ editor, sitio: texto(publisher?.site), calificacion, url, fecha });
      if (fuera.length === MAXIMO) return fuera;
    }
  }
  return fuera;
}

/**
 * Una sola llamada, sin reintentos. Sin clave o sin consulta no sale nada a la
 * red. No registra la consulta, la respuesta ni la clave.
 */
export async function buscarDesmentidos(
  consulta: string | null,
  {
    clave = process.env.FACTCHECK_API_KEY,
    fetch: pedir = fetch,
    ahora = new Date(),
    espera = 3000,
  }: Opciones = {},
): Promise<Desmentidos> {
  if (!consulta || !clave) return "no_consultado";
  const url = new URL(API);
  url.search = new URLSearchParams({
    query: consulta,
    languageCode: "es",
    maxAgeDays: String(DIAS),
    pageSize: "10",
    key: clave,
  }).toString();
  try {
    const res = await pedir(url.toString(), {
      signal: AbortSignal.timeout(espera),
      cache: "no-store",
    });
    if (!res.ok) return "no_consultado";
    return leer(await res.json(), ahora.getTime() - DIAS * 86_400_000);
  } catch {
    return "no_consultado";
  }
}

/**
 * Un desmentido es una señal de apoyo: refuerza un `no_oficial` que ya dan la
 * URL, las señales o la IA, y nunca cambia el veredicto.
 */
export function aplicarDesmentidos(resultado: Resultado, desmentidos: Desmentidos): Resultado {
  if (resultado.veredicto !== "no_oficial") return resultado;
  if (!Array.isArray(desmentidos) || desmentidos.length === 0) return resultado;
  return { ...resultado, motivos: [...new Set([...resultado.motivos, "desmentido_publicado"])] };
}
