// Datos para el modo emergencia «Ya he pulsado».
// Fuente: contexto.md §5.6.6 y avisos INCIBE citados.

export type AccionId = "enlace" | "tarjeta" | "clave" | "instale" | "pague";

export interface Accion {
  id: AccionId;
  label: string;
  descripcion: string;
}

export const ACCIONES: Accion[] = [
  {
    id: "enlace",
    label: "Pulsé el enlace",
    descripcion: "Abrí la web, pero no introduje nada",
  },
  {
    id: "tarjeta",
    label: "Metí mis datos de tarjeta o bancarios",
    descripcion: "Número de tarjeta, CVV, cuenta…",
  },
  {
    id: "clave",
    label: "Di mi contraseña de Cl@ve o mis datos de acceso",
    descripcion: "Usuario, contraseña o código recibido",
  },
  {
    id: "instale",
    label: "Instalé algo o descargué un archivo",
    descripcion: "Una app, un adjunto…",
  },
  {
    id: "pague",
    label: "Pagué",
    descripcion: "Hice una transferencia o un cargo",
  },
];

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
  texto: string;
  urgente: boolean;
  enlaces: { texto: string; url: string }[];
  fuente: string;
}

export const PASOS: Record<PasoId, Paso> = {
  banco: {
    id: "banco",
    texto: "Llama a tu banco ahora para bloquear la tarjeta o cuenta",
    urgente: true,
    enlaces: [],
    fuente: "contexto.md §5.6.6 — INCIBE-2026-666/566/375",
  },
  "banco-pago": {
    id: "banco-pago",
    texto: "Llama a tu banco y pregunta si pueden revertir el cargo",
    urgente: true,
    enlaces: [],
    fuente: "contexto.md §5.6.6 — INCIBE-2026-666",
  },
  capturas: {
    id: "capturas",
    texto: "Guarda capturas del SMS, el correo y la web",
    urgente: false,
    enlaces: [],
    fuente: "contexto.md §5.6.6",
  },
  "cambiar-clave": {
    id: "cambiar-clave",
    texto: "Cambia tu contraseña de Cl@ve Permanente ahora en clave.gob.es",
    urgente: true,
    enlaces: [{ texto: "clave.gob.es", url: "https://clave.gob.es" }],
    fuente: "INCIBE-2026-077, contexto.md §4.4",
  },
  "revisar-dehu": {
    id: "revisar-dehu",
    texto:
      "Entra en DEHú y Carpeta Ciudadana tecleando la URL (no por enlace) y revisa accesos",
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
    texto:
      "No uses ese dispositivo para banca ni contraseñas hasta limpiarlo",
    urgente: true,
    enlaces: [],
    fuente: "INCIBE 017",
  },
  "no-enlace": {
    id: "no-enlace",
    texto: "No vuelvas a abrir ese enlace ni llames al número del mensaje",
    urgente: false,
    enlaces: [],
    fuente: "contexto.md §5.6.3",
  },
  denuncia: {
    id: "denuncia",
    texto: "Denuncia ante la Policía Nacional o la Guardia Civil",
    urgente: false,
    enlaces: [
      { texto: "policia.es", url: "https://www.policia.es" },
      { texto: "web.guardiacivil.es", url: "https://web.guardiacivil.es/es" },
    ],
    fuente: "contexto.md §5.6.6",
  },
  "017": {
    id: "017",
    texto: "Llama al 017 (gratuito, 8:00–23:00, los 365 días)",
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
    texto: "Reporta el fraude a INCIBE",
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
