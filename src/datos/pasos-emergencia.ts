// Datos para el modo emergencia «Ya he pulsado».
// Fuente: contexto.md §5.6.6 y avisos INCIBE citados.
// Aquí va la lógica (qué pasos tocan y cuáles urgen), igual en todos los
// idiomas; los textos están en src/i18n/, en `emergencia`, por id.

export type AccionId = "enlace" | "tarjeta" | "clave" | "instale" | "pague";

export const ACCIONES: readonly AccionId[] = ["enlace", "tarjeta", "clave", "instale", "pague"];

export type PasoId =
  | "banco"
  | "banco-pago"
  | "capturas"
  | "cambiar-clave"
  | "revisar-dehu"
  | "no-dispositivo"
  | "no-enlace"
  | "denuncia"
  | "017"
  | "reporte-incibe";

export interface Paso {
  id: PasoId;
  urgente: boolean;
  enlaces: { texto: string; url: string }[];
  fuente: string;
}

export const PASOS: Record<PasoId, Paso> = {
  banco: {
    id: "banco",
    urgente: true,
    enlaces: [],
    fuente: "contexto.md §5.6.6 — INCIBE-2026-666/566/375",
  },
  "banco-pago": {
    id: "banco-pago",
    urgente: true,
    enlaces: [],
    fuente: "contexto.md §5.6.6 — INCIBE-2026-666",
  },
  capturas: {
    id: "capturas",
    urgente: false,
    enlaces: [],
    fuente: "contexto.md §5.6.6",
  },
  "cambiar-clave": {
    id: "cambiar-clave",
    urgente: true,
    enlaces: [{ texto: "clave.gob.es", url: "https://clave.gob.es" }],
    fuente: "INCIBE-2026-077, contexto.md §4.4",
  },
  "revisar-dehu": {
    id: "revisar-dehu",
    urgente: false,
    enlaces: [
      { texto: "dehu.redsara.es", url: "https://dehu.redsara.es" },
      {
        texto: "carpetaciudadana.gob.es",
        url: "https://carpetaciudadana.gob.es",
      },
    ],
    fuente: "INCIBE-2026-077",
  },
  "no-dispositivo": {
    id: "no-dispositivo",
    urgente: true,
    enlaces: [],
    fuente: "INCIBE 017",
  },
  "no-enlace": {
    id: "no-enlace",
    urgente: false,
    enlaces: [],
    fuente: "contexto.md §5.6.3",
  },
  denuncia: {
    id: "denuncia",
    urgente: false,
    enlaces: [
      { texto: "policia.es", url: "https://www.policia.es" },
      { texto: "web.guardiacivil.es", url: "https://web.guardiacivil.es/es" },
    ],
    fuente: "contexto.md §5.6.6",
  },
  "017": {
    id: "017",
    urgente: false,
    enlaces: [
      {
        texto: "incibe.es/linea-de-ayuda-en-ciberseguridad",
        url: "https://www.incibe.es/linea-de-ayuda-en-ciberseguridad",
      },
    ],
    fuente: "contexto.md §5.6.6, múltiples avisos",
  },
  "reporte-incibe": {
    id: "reporte-incibe",
    urgente: false,
    enlaces: [
      {
        texto: "incibe.es/ciudadania/ayuda/reporte-de-fraude",
        url: "https://www.incibe.es/ciudadania/ayuda/reporte-de-fraude",
      },
    ],
    fuente: "contexto.md §5.6.6",
  },
};

// Mapa acción → lista de paso IDs (en orden de presentación deseado)
const MAPA_ACCION_PASOS: Record<AccionId, PasoId[]> = {
  enlace: ["no-enlace", "017"],
  tarjeta: ["banco", "capturas", "denuncia", "017", "reporte-incibe"],
  clave: ["cambiar-clave", "revisar-dehu", "017", "denuncia", "reporte-incibe"],
  instale: ["no-dispositivo", "017", "capturas"],
  pague: ["banco-pago", "capturas", "denuncia", "017", "reporte-incibe"],
};

/**
 * Devuelve la lista de pasos deduplicada para las acciones seleccionadas.
 * Los urgentes van primero, manteniendo orden relativo de aparición.
 */
export function pasosParaAcciones(acciones: AccionId[]): Paso[] {
  const seen = new Set<PasoId>();
  const ids: PasoId[] = [];
  for (const accion of acciones) {
    for (const id of MAPA_ACCION_PASOS[accion]) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  const urgentes = ids.filter((id) => PASOS[id].urgente);
  const resto = ids.filter((id) => !PASOS[id].urgente);
  return [...urgentes, ...resto].map((id) => PASOS[id]);
}
