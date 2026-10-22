// Tiempos de la animación de carga mientras se comprueba un mensaje (LAB-67).
// Sin React: así se prueban sin navegador.

/** Si la respuesta llega antes, no se enseña el esqueleto: nada parpadea. */
export const RETRASO_MS = 300;
/** Una vez en pantalla, el esqueleto se queda al menos esto. */
export const MINIMO_MS = 400;
/** A partir de aquí se avisa de que puede tardar más. */
export const AVISO_LENTO_MS = 4000;
const PASO_MS = 1500;

/** Paso que se enseña tras `ms` milisegundos comprobando; las frases, en `carga.pasos` (src/i18n/). */
export const pasoEn = <T>(ms: number, pasos: readonly T[]) =>
  pasos[Math.min(pasos.length - 1, Math.floor(ms / PASO_MS))];

export const esLenta = (ms: number) => ms >= AVISO_LENTO_MS;

/** Cuánto esperar antes de cambiar el esqueleto por el resultado. */
export const esperaAntesDeMostrar = (inicioEsqueleto: number | null, ahora: number) =>
  inicioEsqueleto === null ? 0 : Math.max(0, MINIMO_MS - (ahora - inicioEsqueleto));
