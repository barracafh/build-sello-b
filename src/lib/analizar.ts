// Pipeline de un mensaje: lo comparten la ruta /api/verificar y el runner de
// evals, para que los evals midan lo que se publica. No guarda ni registra el texto.
import {
  clasificarMensaje,
  type OpcionesClasificador,
  type SenalLlm,
} from "./clasificar";
import { fragmentosDeterministas, fusionar, type Fragmento } from "./fragmentos";
import { combinar, senales, type Senal } from "./senales";
import { extraerEnlace } from "./url";
import { verificar, type Resultado } from "./verificar";

export type Analisis = Resultado & {
  // Motivo en una frase; solo cuando ha clasificado el modelo.
  motivo?: string;
  // Señales deterministas, con su nivel.
  senales: Senal[];
  // Señales finales (deterministas + modelo), con evidencia y fuente.
  señales?: SenalLlm[];
  entidad_suplantada?: string | null;
  // Si se ha llamado al modelo.
  clasificado: boolean;
  // Dónde está cada trampa en el texto enviado: rangos [inicio, fin) sin solapes.
  fragmentos: Fragmento[];
};

// Un texto que es solo un enlace no necesita al modelo (LAB-34).
export function esSoloUrl(texto: string): boolean {
  const t = texto.trim();
  if (/\s/.test(t)) return false;
  const enlace = extraerEnlace(t);
  if (!enlace) return false;
  return t === enlace.crudo || t.replace(/[.,;:!?)}»”]+$/, "") === enlace.crudo;
}

export async function analizar(
  texto: string,
  opciones: OpcionesClasificador = {},
): Promise<Analisis> {
  const url = verificar(texto);
  const lista = senales(texto, url);
  const resultado = combinar(url, lista, texto);
  const reglas = fragmentosDeterministas(texto, lista, url);
  if (esSoloUrl(texto)) {
    return { ...resultado, senales: lista, clasificado: false, fragmentos: fusionar(texto, reglas) };
  }

  const c = await clasificarMensaje(texto, { resultado, senales: lista }, opciones);
  return {
    ...resultado,
    veredicto: c.veredicto,
    web_oficial: c.web_oficial ?? undefined,
    senales: lista,
    señales: c.señales,
    motivo: c.motivo,
    entidad_suplantada: c.entidad_suplantada,
    clasificado: true,
    fragmentos: fusionar(texto, [...reglas, ...c.fragmentos]),
  };
}
