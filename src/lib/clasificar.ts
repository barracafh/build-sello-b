// Clasificador de mensajes con LLM (HelmCode). El modelo propone; las reglas de
// `combinarClasificacion` deciden, y son puras para poder probarlas sin red.
// No guarda ni registra el texto del ciudadano.
import type { Idioma } from "@/i18n";
import { completar as completarReal, type Mensaje, type OpcionesIa } from "./ia";
import { SISTEMA, mensajeUsuario, type Determinista } from "./clasificar-prompt";
import { fragmentosDelModelo, type Fragmento } from "./fragmentos";
import type { Senal } from "./senales";
import { neutralizar } from "./url";
import { verificar, type Veredicto } from "./verificar";

export type { Determinista } from "./clasificar-prompt";

export const MOTIVO_NO_DISPONIBLE = "clasificador no disponible";
export const TIMEOUT_MS = 8000;
// Id de DeepSeek Flash en HelmCode (GET /models). No es un secreto.
export const MODELO_POR_DEFECTO = "deepseek-v4-flash";

export type SenalLlm = { codigo: string; evidencia: string; fuente: string };
// El modelo puede citar dónde está la señal; la cita solo vale si está en el mensaje.
export type SenalModelo = SenalLlm & { fragmento?: string | null };

export type SalidaLlm = {
  veredicto: Veredicto;
  motivo: string;
  señales: SenalModelo[];
  entidad_suplantada: string | null;
  web_oficial: string | null;
};

export type Clasificacion = Omit<SalidaLlm, "señales"> & { señales: SenalLlm[] };

const esTexto = (v: unknown): v is string => typeof v === "string";
const esTextoONulo = (v: unknown): v is string | null => v === null || esTexto(v);

export function esSalidaLlm(v: unknown): v is SalidaLlm {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.veredicto === "oficial_verificado" ||
      o.veredicto === "no_oficial" ||
      o.veredicto === "no_determinable") &&
    esTexto(o.motivo) &&
    Array.isArray(o.señales) &&
    o.señales.every(
      (s) =>
        typeof s === "object" &&
        s !== null &&
        esTexto((s as SenalLlm).codigo) &&
        esTexto((s as SenalLlm).evidencia) &&
        esTexto((s as SenalLlm).fuente),
    ) &&
    esTextoONulo(o.entidad_suplantada) &&
    esTextoONulo(o.web_oficial)
  );
}

// Los modelos a veces envuelven el JSON en un bloque ```json.
function leerJson(bruto: string): unknown {
  const sinBloque = bruto.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(sinBloque);
}

const URL_EN_TEXTO = /(?:https?|hxxps?):\/\/[^\s<>"')]+/gi;
// Lo que repite el modelo nunca sale como enlace: las URL salen neutralizadas.
const limpio = (texto: string, max = 300) =>
  texto.replace(URL_EN_TEXTO, (u) => neutralizar(u)).trim().slice(0, max);

const FUENTE_DE_SENAL = (codigo: string) =>
  codigo.startsWith("enlace_") ? "§5.2" : codigo === "pide_dinero" || codigo === "pide_datos" || codigo === "instruccion_qr" ? "§5.4" : "§1.4";

const deSenal = (s: Senal): SenalLlm => ({
  codigo: s.codigo,
  evidencia: s.texto,
  fuente: FUENTE_DE_SENAL(s.codigo),
});

// Solo se acepta la web oficial del modelo si la lista de webs oficiales la
// reconoce: así no puede salir un enlace inventado.
function webOficialSegura(propuesta: string | null): string | null {
  if (!propuesta) return null;
  const r = verificar(propuesta);
  return r.veredicto === "oficial_verificado" ? (r.web_oficial ?? null) : null;
}

// Las mismas señales del modelo que entran en `combinarClasificacion`.
const senalesDelModelo = (llm: SalidaLlm | null) =>
  (llm?.señales ?? []).filter((s) => s.codigo !== "sin_senales").slice(0, 8);

const sinDuplicados = (lista: SenalLlm[]) =>
  lista.filter((s, i) => lista.findIndex((x) => x.codigo === s.codigo) === i);

// Orden de las reglas (contexto.md §1.1, §1.4):
// 1. un `no_oficial` determinista gana siempre;
// 2. sin salida del modelo: «clasificador no disponible» y `no_determinable`,
//    salvo un `oficial_verificado` de la URL, que se mantiene;
// 3. el `oficial_verificado` solo viene de la comprobación de la URL: si el modelo
//    lo dice, baja a `no_determinable`; y si la URL es oficial pero el modelo
//    sospecha, también baja a `no_determinable`;
// 4. sin otra señal, `no_determinable`.
export function combinarClasificacion(
  llm: SalidaLlm | null,
  det: Determinista,
): Clasificacion {
  const { resultado } = det;
  const deterministas = det.senales.map(deSenal);
  const entidad = limpio(llm?.entidad_suplantada ?? resultado.entidad ?? "", 100) || null;
  const web_oficial = resultado.web_oficial ?? webOficialSegura(llm?.web_oficial ?? null);
  const salida = (veredicto: Veredicto, motivo: string, extra: SenalLlm[]): Clasificacion => ({
    veredicto,
    motivo,
    señales: sinDuplicados([...deterministas, ...extra]).slice(0, 12),
    entidad_suplantada: entidad,
    web_oficial,
  });
  const delModelo = senalesDelModelo(llm).map((s) => ({ codigo: s.codigo, evidencia: limpio(s.evidencia), fuente: limpio(s.fuente, 40) }));
  const motivoLlm = llm ? limpio(llm.motivo) : "";

  if (resultado.veredicto === "no_oficial") {
    return salida(
      "no_oficial",
      motivoLlm || "El mensaje tiene señales claras de suplantación.",
      delModelo,
    );
  }
  // Sin modelo, el `oficial_verificado` de la URL (LAB-34) se mantiene: la
  // reserva solo sustituye al modelo, no a la comprobación determinista.
  if (!llm) {
    return salida(
      resultado.veredicto === "oficial_verificado" ? "oficial_verificado" : "no_determinable",
      MOTIVO_NO_DISPONIBLE,
      [],
    );
  }
  if (resultado.veredicto === "oficial_verificado") {
    return llm.veredicto === "no_oficial"
      ? salida("no_determinable", motivoLlm, delModelo)
      : salida("oficial_verificado", motivoLlm, delModelo);
  }
  if (llm.veredicto === "no_oficial") return salida("no_oficial", motivoLlm, delModelo);
  return salida("no_determinable", motivoLlm || "No podemos confirmar de quién es el mensaje.", delModelo);
}

export type OpcionesClasificador = {
  // Para pruebas y para el runner de evals.
  completar?: (mensajes: Mensaje[], opciones?: OpcionesIa) => Promise<string>;
  modelo?: string;
  timeoutMs?: number;
  /** Idioma en que se pide el `motivo`; no cambia el veredicto. */
  idioma?: Idioma;
  alUso?: OpcionesIa["alUso"];
};

export const modeloClasificador = () =>
  process.env.HELMCODE_MODEL_CLASIFICADOR || MODELO_POR_DEFECTO;

// Una sola llamada al modelo, temperatura 0 y JSON. Cualquier fallo (red, 429
// agotado, tiempo, JSON no válido) devuelve `no_determinable` y la página sigue.
export async function clasificarMensaje(
  texto: string,
  det: Determinista,
  opciones: OpcionesClasificador = {},
): Promise<Clasificacion & { fragmentos: Fragmento[] }> {
  const completar = opciones.completar ?? completarReal;
  const signal = AbortSignal.timeout(opciones.timeoutMs ?? TIMEOUT_MS);
  let llm: SalidaLlm | null = null;
  try {
    // La carrera con `signal` corta aunque el cliente ignore la señal.
    const abortada = new Promise<never>((_, rechazar) =>
      signal.addEventListener("abort", () => rechazar(signal.reason), { once: true }),
    );
    abortada.catch(() => {}); // si el modelo gana, el aborto tardío no es un error
    const bruto = await Promise.race([
      completar(
        [
          { role: "system", content: SISTEMA },
          { role: "user", content: mensajeUsuario(texto, det, opciones.idioma) },
        ],
        {
          modelo: opciones.modelo ?? modeloClasificador(),
          temperatura: 0,
          formatoJson: true,
          signal,
          alUso: opciones.alUso,
        },
      ),
      abortada,
    ]);
    const datos = leerJson(bruto);
    llm = esSalidaLlm(datos) ? datos : null;
  } catch {
    llm = null;
  }
  return {
    ...combinarClasificacion(llm, det),
    fragmentos: fragmentosDelModelo(texto, senalesDelModelo(llm)),
  };
}
