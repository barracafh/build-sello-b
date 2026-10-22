// Cómo se enseña cada veredicto de /api/verificar. El código crudo
// (`no_determinable`…) no se enseña nunca: siempre icono y palabra. Las
// palabras (etiqueta, titular, entradilla y pasos) están en src/i18n/.
import { CircleCheck, CircleQuestionMark, CircleX, type LucideIcon } from "lucide-react";
import { leerFragmentos, type Fragmento } from "@/lib/trozos";
import { neutralizar } from "@/lib/url";
import dominios from "../../datos/dominios-oficiales.json";

export type Veredicto = "oficial_verificado" | "no_oficial" | "no_determinable";

export type FichaVeredicto = {
  veredicto: Veredicto;
  icono: LucideIcon;
  /** Clases de la píldora. Solo tokens de Sol; el significado lo llevan el icono y la palabra. */
  tono: string;
  /** Fondo de la cabecera del bloque del veredicto (tokens de Sol). */
  fondo: string;
  /** Color del icono de la píldora sobre la cabecera. */
  colorIcono: string;
  /** Si se ofrece llamar al 017. */
  ofrece017: boolean;
};

export const VEREDICTOS: Record<Veredicto, FichaVeredicto> = {
  no_oficial: {
    veredicto: "no_oficial",
    icono: CircleX,
    // Texto en foreground: destructive sobre su tinte se queda en 4,2:1. El rojo va en el icono.
    tono: "bg-destructive/10 text-foreground [&>svg]:text-destructive",
    fondo: "bg-destructive/10",
    colorIcono: "[&>svg]:text-destructive",
    ofrece017: true,
  },
  no_determinable: {
    veredicto: "no_determinable",
    icono: CircleQuestionMark,
    tono: "bg-(--warning) text-(--warning-foreground)",
    fondo: "bg-(--warning)",
    colorIcono: "[&>svg]:text-(--warning-foreground)",
    ofrece017: true,
  },
  oficial_verificado: {
    veredicto: "oficial_verificado",
    icono: CircleCheck,
    // Verde de éxito de Import@ss (src/styles/importass.css, LAB-58): el texto
    // sigue en foreground sobre el tinte y el verde va en el icono (4,97:1).
    tono: "bg-iss-success-700/20 text-foreground [&>svg]:text-iss-success-700",
    fondo: "bg-iss-success-700/20",
    colorIcono: "[&>svg]:text-iss-success-700",
    ofrece017: false,
  },
};

/** Ante un valor desconocido, la duda: nunca «oficial». */
export function fichaDe(veredicto: string): FichaVeredicto {
  return Object.hasOwn(VEREDICTOS, veredicto)
    ? VEREDICTOS[veredicto as Veredicto]
    : VEREDICTOS.no_determinable;
}

const FEMENINO = new Set([
  "agencia", "aeat", "dgt", "dirección", "seguridad", "tesorería", "generalitat",
  "generalidad", "conselleria", "consejería", "dehú", "sede", "junta", "policía",
  "guardia", "comunidad", "diputación", "oficina", "administración", "tgss",
]);
const MASCULINO = new Set([
  "sepe", "servicio", "ministerio", "ayuntamiento", "ajuntament", "instituto",
  "incibe", "gobierno", "registro", "banco", "consell", "tribunal", "imserso",
]);

/** «DGT» → «de la DGT»; «SEPE» → «del SEPE»; «Correos» → «de Correos». */
export function deEntidad(entidad: string | null | undefined): string | null {
  const nombre = entidad?.trim();
  if (!nombre) return null;
  const [primera = "", ...resto] = nombre.split(/\s+/);
  const palabra = primera.toLowerCase();
  if (palabra === "la" || palabra === "las") return `de ${nombre}`;
  if (palabra === "el") return `del ${resto.join(" ")}`;
  if (palabra === "los") return `de ${nombre}`;
  if (FEMENINO.has(palabra)) return `de la ${nombre}`;
  if (MASCULINO.has(palabra)) return `del ${nombre}`;
  return `de ${nombre}`;
}

// Solo se enlazan las webs oficiales de la lista (SETUP.md: «El único enlace
// clicable es la web oficial de la lista»), aunque la API devuelva otra cosa.
const HOSTS_OFICIALES = new Set(
  dominios.entidades.map((entidad) => new URL(entidad.web_oficial).hostname),
);

/** La web oficial como enlace seguro: https y de la lista, con su nombre corto. */
export function webOficial(
  url: string | null | undefined,
): { href: string; direccion: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !HOSTS_OFICIALES.has(u.hostname)) return null;
    return { href: u.href, direccion: u.hostname };
  } catch {
    return null;
  }
}

export type Senal = { codigo: string; nivel: "roja" | "naranja"; texto: string };
/** Señal del clasificador (LAB-39): deterministas y del modelo, con su apartado. */
export type SenalFinal = { codigo: string; evidencia: string; fuente: string };
type Enlace = { nombre: string; url: string };
export type Desmentido = {
  editor: string;
  sitio: string | null;
  calificacion: string;
  url: string;
  fecha: string | null;
};

export type Respuesta = {
  veredicto: string;
  /** Códigos de /api/verificar; el componente los traduce a frases. */
  motivos: string[];
  /** Ya neutralizada: se enseña como texto, nunca como enlace. */
  url_analizada: string | null;
  remitente_analizado: string | null;
  entidad: string | null;
  web_oficial: string | null;
  /** Página que respalda los dominios de la entidad. */
  fuente: string | null;
  indicador: Enlace | null;
  aviso: Enlace | null;
  senales: Senal[];
  reputacion: string | null;
  rdap: string | null;
  /** Si el mensaje pasó por el clasificador (no era solo un enlace). */
  clasificado: boolean;
  /** Motivo en una frase; «clasificador no disponible» si el modelo falló. */
  motivo: string | null;
  señales: SenalFinal[];
  entidad_suplantada: string | null;
  /** Desmentidos publicados de mensajes parecidos; vacío si no se consultó. */
  desmentidos: Desmentido[];
  /** Dónde está cada trampa en el texto enviado (LAB-62). */
  fragmentos: Fragmento[];
};

const textoO = (valor: unknown) =>
  typeof valor === "string" && valor.trim() ? valor.trim() : null;

const enlaceO = (valor: unknown): Enlace | null => {
  const e = valor as Record<string, unknown> | null;
  const nombre = textoO(e?.nombre);
  const url = textoO(e?.url);
  return nombre && url ? { nombre, url } : null;
};

const esSenalFinal = (s: unknown): s is SenalFinal => {
  const x = s as Record<string, unknown> | null;
  return (
    typeof x?.codigo === "string" &&
    typeof x.evidencia === "string" &&
    typeof x.fuente === "string"
  );
};

const esSenal = (s: unknown): s is Senal => {
  const x = s as Record<string, unknown> | null;
  return (
    typeof x?.codigo === "string" &&
    typeof x.texto === "string" &&
    (x.nivel === "roja" || x.nivel === "naranja")
  );
};

// Los desmentidos se enlazan: solo con https, nunca otro esquema.
const leerDesmentido = (valor: unknown): Desmentido | null => {
  const d = valor as Record<string, unknown> | null;
  const editor = textoO(d?.editor);
  const calificacion = textoO(d?.calificacion);
  const url = textoO(d?.url);
  if (!editor || !calificacion || !url) return null;
  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { editor, sitio: textoO(d?.sitio), calificacion, url, fecha: textoO(d?.fecha) };
};

/** Lee la respuesta de /api/verificar sin fiarse de su forma; null si no trae veredicto. */
export function leerRespuesta(datos: unknown): Respuesta | null {
  if (typeof datos !== "object" || datos === null) return null;
  const d = datos as Record<string, unknown>;
  if (typeof d.veredicto !== "string") return null;
  const url = textoO(d.url_analizada);
  return {
    veredicto: d.veredicto,
    motivos: Array.isArray(d.motivos)
      ? d.motivos.filter((m): m is string => typeof m === "string")
      : [],
    // `neutralizar` es idempotente: si la API la manda viva, aquí se apaga.
    url_analizada: url && neutralizar(url),
    remitente_analizado: textoO(d.remitente_analizado),
    entidad: textoO(d.entidad),
    web_oficial: textoO(d.web_oficial),
    fuente: textoO(d.fuente),
    indicador: enlaceO(d.indicador),
    aviso: enlaceO(d.aviso),
    senales: Array.isArray(d.senales) ? d.senales.filter(esSenal) : [],
    reputacion: textoO(d.reputacion),
    rdap: textoO(d.rdap),
    clasificado: d.clasificado === true,
    motivo: textoO(d.motivo),
    señales: Array.isArray(d.señales) ? d.señales.filter(esSenalFinal) : [],
    entidad_suplantada: textoO(d.entidad_suplantada),
    desmentidos: Array.isArray(d.desmentidos)
      ? d.desmentidos.map(leerDesmentido).filter((x): x is Desmentido => x !== null)
      : [],
    fragmentos: leerFragmentos(d.fragmentos),
  };
}

/** 2000 → «2.000» (en español, `toLocaleString` no agrupa los números de 4 cifras). */
export const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const mesEnCastellano = (mes: number, año: number) =>
  new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    Date.UTC(año, mes),
  );

/**
 * «2025-03-01T00:00:00Z» → «marzo de 2025»; null si no es una fecha. Cada idioma
 * pasa su `nombrar` (src/i18n/): Chrome no trae los meses en euskera.
 */
export function mesDe(
  fecha: string | null,
  nombrar: (mes: number, año: number) => string = mesEnCastellano,
): string | null {
  const ms = fecha ? Date.parse(fecha) : NaN;
  if (Number.isNaN(ms)) return null;
  const d = new Date(ms);
  return nombrar(d.getUTCMonth(), d.getUTCFullYear());
}
