// Juego «¿Estafa o no?»: los 10 casos de datos/mensajes-ejemplo.json como
// tarjetas. Los F son fraudes publicados por INCIBE; los L, avisos legítimos.
import { neutralizar } from "@/lib/url";
import { webOficial } from "@/lib/veredicto";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Caso = (typeof ejemplos)[number] & {
  url_prueba_sintetica?: string | null;
  url?: string;
  entidad?: string | null;
};

export type Ronda = {
  id: string;
  tipo: "SMS" | "Correo" | "Web";
  texto: string;
  /** Neutralizada: se enseña como texto, nunca como enlace. */
  direccion: string | null;
  esEstafa: boolean;
  /** Por qué, con las pistas del caso. */
  pistas: string[];
  web: { href: string; direccion: string } | null;
  fuente: { nombre: string; url: string };
};

const TIPOS: Record<string, Ronda["tipo"]> = { sms: "SMS", email: "Correo", web: "Web" };

const fuenteDe = (caso: Caso) => {
  const url = new URL(caso.fuente);
  const nombre = url.hostname.endsWith("incibe.es")
    ? "Aviso de INCIBE"
    : `${caso.entidad ?? "Web oficial"}`;
  return { nombre, url: caso.fuente };
};

export const RONDAS: readonly Ronda[] = (ejemplos as Caso[]).map((caso) => {
  const url = caso.url_prueba_sintetica ?? caso.url ?? null;
  return {
    id: caso.id,
    tipo: TIPOS[caso.tipo] ?? "SMS",
    texto: caso.texto,
    direccion: url && neutralizar(url),
    esEstafa: caso.esperado === "no_oficial",
    pistas: caso.pistas,
    web: webOficial(caso.web_oficial_correcta),
    fuente: fuenteDe(caso),
  };
});

/** Fisher-Yates; `azar` se puede fijar en los tests. */
export function barajar<T>(lista: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Cuánto hay que arrastrar la tarjeta (px) para que cuente como respuesta. */
export const UMBRAL_DESLIZAR = 110;

/** Respuesta a partir del arrastre: null si no llega al umbral. */
export const respuestaDeArrastre = (dx: number): boolean | null =>
  dx <= -UMBRAL_DESLIZAR ? true : dx >= UMBRAL_DESLIZAR ? false : null;

/** Frase final según los aciertos. */
export function valoracion(aciertos: number, total: number): string {
  if (aciertos === total) return "¡Perfecto! Ninguna estafa te ha colado.";
  if (aciertos >= total - 2) return "Muy bien. Repasa las que has fallado: son las que más engañan.";
  if (aciertos >= total / 2) return "No está mal, pero alguna estafa te habría colado.";
  return "Las estafas están muy bien hechas. Repasa las pistas y vuelve a probar.";
}
