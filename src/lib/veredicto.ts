// Cómo se enseña cada veredicto de /api/verificar. El código crudo
// (`no_determinable`…) no se enseña nunca: siempre icono y palabra.
import { CircleCheck, CircleQuestionMark, CircleX, type LucideIcon } from "lucide-react";
import { neutralizar } from "@/lib/url";
import dominios from "../../datos/dominios-oficiales.json";

export type Veredicto = "oficial_verificado" | "no_oficial" | "no_determinable";

type Contexto = {
  /** «de la DGT», ya con su preposición; null si la API no la da. */
  deEntidad: string | null;
  /** Si el mensaje traía un enlace. */
  hayEnlace: boolean;
};

export type FichaVeredicto = {
  etiqueta: string;
  icono: LucideIcon;
  titular: (contexto: Contexto) => string;
  /** Lo primero que hay que hacer, en una frase. */
  entradilla: string;
  /** Clases de la píldora. Solo tokens de Sol; el significado lo llevan el icono y la palabra. */
  tono: string;
  /** Fondo de la cabecera del bloque del veredicto (tokens de Sol). */
  fondo: string;
  /** Color del icono de la píldora sobre la cabecera. */
  colorIcono: string;
  /** Pasos de «Qué hacer ahora». */
  pasos: readonly string[];
  /** Si se ofrece llamar al 017. */
  ofrece017: boolean;
};

export const VEREDICTOS: Record<Veredicto, FichaVeredicto> = {
  no_oficial: {
    etiqueta: "No es oficial",
    icono: CircleX,
    titular: ({ deEntidad, hayEnlace }) => {
      const que = hayEnlace ? "Este enlace" : "Este mensaje";
      return deEntidad ? `${que} no es ${deEntidad}` : `${que} no es oficial`;
    },
    entradilla: "No pulses sus enlaces y no respondas al mensaje.",
    // Texto en foreground: destructive sobre su tinte se queda en 4,2:1. El rojo va en el icono.
    tono: "bg-destructive/10 text-foreground [&>svg]:text-destructive",
    fondo: "bg-destructive/10",
    colorIcono: "[&>svg]:text-destructive",
    pasos: [
      "No pulses el enlace ni respondas al mensaje.",
      "Si quieres comprobar algo, entra tú en la web oficial escribiendo la dirección.",
      "Si ya lo has pulsado o has dado datos, llama gratis al 017.",
    ],
    ofrece017: true,
  },
  no_determinable: {
    etiqueta: "No podemos confirmarlo",
    icono: CircleQuestionMark,
    titular: ({ deEntidad }) =>
      deEntidad
        ? `No podemos confirmar que sea ${deEntidad}`
        : "No podemos saber quién lo envía",
    entradilla: "Que el texto parezca oficial no prueba quién lo envía.",
    tono: "bg-(--warning) text-(--warning-foreground)",
    fondo: "bg-(--warning)",
    colorIcono: "[&>svg]:text-(--warning-foreground)",
    pasos: [
      "No pulses el enlace ni respondas al mensaje.",
      "Entra tú en la web oficial escribiendo la dirección.",
      "Si dudas, llama gratis al 017.",
    ],
    ofrece017: true,
  },
  oficial_verificado: {
    etiqueta: "Web oficial",
    icono: CircleCheck,
    titular: ({ deEntidad }) =>
      deEntidad
        ? `Esta web es ${deEntidad}`
        : "Esta web está en nuestra lista de webs oficiales",
    entradilla:
      "Solo comprobamos la dirección, no lo que te pidan dentro. Para volver a entrar, escribe tú la dirección.",
    // Neutro a propósito: Sol no tiene verde y es el veredicto con el que menos
    // queremos que alguien se relaje.
    tono: "bg-muted text-foreground",
    fondo: "bg-muted",
    colorIcono: "[&>svg]:text-foreground",
    pasos: [
      "Aun así, no des datos si no lo esperabas.",
      "Si dudas, entra tú escribiendo la dirección de la web oficial.",
      "Si ya has dado datos, llama gratis al 017 de INCIBE.",
    ],
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
type Enlace = { nombre: string; url: string };

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
};

const textoO = (valor: unknown) =>
  typeof valor === "string" && valor.trim() ? valor.trim() : null;

const enlaceO = (valor: unknown): Enlace | null => {
  const e = valor as Record<string, unknown> | null;
  const nombre = textoO(e?.nombre);
  const url = textoO(e?.url);
  return nombre && url ? { nombre, url } : null;
};

const esSenal = (s: unknown): s is Senal => {
  const x = s as Record<string, unknown> | null;
  return (
    typeof x?.codigo === "string" &&
    typeof x.texto === "string" &&
    (x.nivel === "roja" || x.nivel === "naranja")
  );
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
  };
}

/** 2000 → «2.000» (en español, `toLocaleString` no agrupa los números de 4 cifras). */
export const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
