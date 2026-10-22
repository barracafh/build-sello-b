// Dónde está cada trampa dentro del propio mensaje (LAB-62). Puro: sin red ni IA.
// Devuelve rangos [inicio, fin) sobre el texto original; nunca un trozo que no
// esté en el mensaje. El color sale siempre del código de la señal.
import { ESCAPES, REGLAS, numerosAjenos, pedidoMismaLongitud, type Senal } from "./senales";
import { rangosDeUrl, type Fragmento, type Nivel } from "./trozos";
import { extraerEnlace } from "./url";
import { verificar, type Resultado } from "./verificar";

export type { Fragmento } from "./trozos";

// Color de cada código del clasificador; los que no están aquí no se subrayan.
const NIVEL_DE_CODIGO: Record<string, Nivel> = {
  pide_dinero: "roja",
  pide_datos: "roja",
  amenaza: "roja",
  remitente_falso: "roja",
  instruccion_qr: "roja",
  enlace_sospechoso: "roja",
  devolucion_con_enlace: "roja",
  urgencia: "naranja",
  ortografia: "naranja",
  instruccion_rara: "naranja",
};

// Qué grupo de reglas subraya cada señal y sobre qué versión del texto.
const GRUPO_DE_CODIGO: Record<string, { reglas: RegExp[]; pedido?: true }> = {
  amenaza: { reglas: REGLAS.AMENAZA },
  urgencia: { reglas: REGLAS.URGENCIA },
  ortografia: { reglas: REGLAS.ORTOGRAFIA },
  pide_dinero: { reglas: REGLAS.DINERO, pedido: true },
  pide_datos: { reglas: REGLAS.DATOS, pedido: true },
  instruccion_qr: { reglas: REGLAS.QR },
  instruccion_rara: { reglas: REGLAS.INSTRUCCION },
};

// Copia global: las reglas de `senales` no llevan `g` y no comparten `lastIndex`.
const global = (r: RegExp) => new RegExp(r.source, r.flags.includes("g") ? r.flags : `${r.flags}g`);

const coincidencias = (reglas: RegExp[], texto: string) =>
  reglas.flatMap((r) =>
    [...texto.matchAll(global(r))]
      .filter((m) => m[0].length > 0)
      .map((m) => ({ inicio: m.index, fin: m.index + m[0].length })),
  );

const CORREO = /^([^@/\s]+)@([^@/\s]+\.[^@/\s]+)$/;
const RUIDO_INICIO = /^[([{<"'«“]+/;
const RUIDO_FINAL = /[.,;:!?)}>»”]+$/;

// Direcciones de correo del texto cuya web no es oficial, con su posición.
function correosAjenos(texto: string) {
  const salida: { inicio: number; fin: number }[] = [];
  for (const m of texto.matchAll(/\S+/g)) {
    const sinInicio = m[0].replace(RUIDO_INICIO, "");
    const token = sinInicio.replace(RUIDO_FINAL, "");
    const limpio = ESCAPES.reduce((t, [de, a]) => t.replace(de, a), token);
    const correo = CORREO.exec(limpio);
    if (!correo) continue;
    if (verificar(`https://${correo[2]}`).veredicto === "oficial_verificado") continue;
    const inicio = m.index + (m[0].length - sinInicio.length);
    salida.push({ inicio, fin: inicio + token.length });
  }
  return salida;
}

function rangoDelEnlace(texto: string) {
  const enlace = extraerEnlace(texto);
  const inicio = enlace ? texto.indexOf(enlace.crudo) : -1;
  return inicio < 0 ? [] : [{ inicio, fin: inicio + enlace!.crudo.length }];
}

/** Rangos de las señales deterministas que han saltado, con el nivel de cada una. */
export function fragmentosDeterministas(
  texto: string,
  lista: Senal[],
  resultadoUrl: Resultado,
): Fragmento[] {
  const pedido = pedidoMismaLongitud(texto);
  return lista.flatMap((s) => {
    const con = (rangos: { inicio: number; fin: number }[]) =>
      rangos.map((r) => ({ ...r, nivel: s.nivel, codigo: s.codigo }));
    if (s.codigo.startsWith("enlace_")) {
      return resultadoUrl.url_analizada ? con(rangoDelEnlace(texto)) : [];
    }
    if (s.codigo === "remitente_falso") return con(correosAjenos(texto));
    const grupo = GRUPO_DE_CODIGO[s.codigo];
    if (!grupo) return [];
    const rangos = coincidencias(grupo.reglas, grupo.pedido ? pedido : texto);
    return con(s.codigo === "instruccion_rara" ? [...rangos, ...numerosAjenos(texto)] : rangos);
  });
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Busca cada cita del modelo en el texto; la que no está se descarta. */
export function fragmentosDelModelo(
  texto: string,
  señales: { codigo: string; fragmento?: unknown }[],
): Fragmento[] {
  return señales.flatMap((s) => {
    const nivel = NIVEL_DE_CODIGO[s.codigo];
    if (!nivel || typeof s.fragmento !== "string") return [];
    const palabras = s.fragmento.trim().split(/\s+/).filter(Boolean);
    const cita = palabras.join(" ");
    if (cita.length < 2 || cita.length > 200) return [];
    const m = new RegExp(palabras.map(escapar).join(String.raw`\s+`), "iu").exec(texto);
    return m ? [{ inicio: m.index, fin: m.index + m[0].length, nivel, codigo: s.codigo }] : [];
  });
}

const RANGO: Record<Nivel, number> = { naranja: 1, roja: 2 };

/**
 * Funde los rangos: los solapes se unen y gana la roja; un rango que toca una
 * URL la cubre entera, para que nunca se parta una dirección al pintarla. Los
 * tramos que solo son espacio se descartan.
 */
export function fusionar(texto: string, fragmentos: Fragmento[]): Fragmento[] {
  const urls = rangosDeUrl(texto);
  const celdas: ({ nivel: Nivel; codigo: string } | null)[] = Array(texto.length).fill(null);
  for (const f of fragmentos) {
    let inicio = Math.max(0, f.inicio);
    let fin = Math.min(texto.length, f.fin);
    if (inicio >= fin) continue;
    for (const u of urls) {
      if (u.inicio < fin && inicio < u.fin) {
        inicio = Math.min(inicio, u.inicio);
        fin = Math.max(fin, u.fin);
      }
    }
    for (let i = inicio; i < fin; i++) {
      const actual = celdas[i];
      if (!actual || RANGO[f.nivel] > RANGO[actual.nivel]) {
        celdas[i] = { nivel: f.nivel, codigo: f.codigo };
      }
    }
  }
  const salida: Fragmento[] = [];
  celdas.forEach((c, i) => {
    if (!c) return;
    const ultimo = salida.at(-1);
    if (ultimo && ultimo.fin === i && ultimo.nivel === c.nivel) ultimo.fin = i + 1;
    else salida.push({ inicio: i, fin: i + 1, ...c });
  });
  // Un tramo que solo es espacio no señala nada y el lector de pantalla
  // anunciaría «señal naranja:» antes de un blanco.
  return salida.filter((f) => /\S/u.test(texto.slice(f.inicio, f.fin)));
}
