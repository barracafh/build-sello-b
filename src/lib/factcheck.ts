// Desmentidos publicados (Google Fact Check Tools, `claims:search`). Solo en el
// servidor. La consulta se arma solo con un vocabulario fijo: nunca lleva el texto
// del ciudadano ni su enlace, así que no puede llevar nombres, teléfonos, correos,
// importes ni IBAN. No se guarda ni se registra nada.
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

// Patrones de estafa, del más general al más concreto. Un aviso legítimo («tiene
// una notificación», «su envío está en camino») no casa con ninguno, así que no
// se consulta. Varios patrones dan la misma etiqueta: la general encuentra más
// desmentidos («Correos paquete» sí; «Correos aduana» o «paquete retenido», no).
const PATRONES: [RegExp, string][] = [
  [regla(String.raw`multas?`), "multa"],
  [regla(String.raw`devoluci[oó]n|reembolso`), "devolución"],
  [cerca(String.raw`paquete|env[ií]o`, String.raw`retenid[oa]`), "paquete"],
  [regla(String.raw`aduanas?`), "paquete"],
  [regla(String.raw`tarjeta sanit[aà]ria`), "tarjeta sanitaria"],
  [regla(String.raw`embargo|embargar`), "embargo"],
];

/** Todas las palabras que puede llevar una consulta. */
export const VOCABULARIO = [
  ...new Set([...ORGANISMOS, ...PATRONES].flatMap(([, etiqueta]) => etiqueta.split(" "))),
];

/**
 * La consulta para `claims:search`: el organismo y el primer patrón que casa,
 * nada más. Ni el texto ni el dominio del enlace. Null, sin llamada, con
 * `oficial_verificado` o si falta el organismo o el patrón.
 */
export function consultaDesmentido(texto: string, resultado: Resultado): string | null {
  if (resultado.veredicto === "oficial_verificado") return null;
  const donde = `${texto} ${resultado.entidad ?? ""}`;
  const organismo = ORGANISMOS.find(([patron]) => patron.test(donde))?.[1];
  const patron = PATRONES.find(([p]) => p.test(texto))?.[1];
  return organismo && patron ? `${organismo} ${patron}` : null;
}

const API = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
const DIAS = 730;
const MAXIMO = 3;

type Opciones = {
  /** Si se pasa (también `undefined`, `null` o ""), manda sobre el entorno: vacío es «sin clave». */
  clave?: string | null;
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
  opciones: Opciones = {},
): Promise<Desmentidos> {
  const { fetch: pedir = fetch, ahora = new Date(), espera = 3000 } = opciones;
  const clave = "clave" in opciones ? opciones.clave : process.env.FACTCHECK_API_KEY;
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
