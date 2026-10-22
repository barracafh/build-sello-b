// Lógica pura de URLs. Nunca abre, sigue ni expande lo que analiza.
const PATRON_URL = /(?:https?|hxxps?):\/\/[^\s<>"']+/i;
const PUNTUACION_FINAL = /[.,;:!?)}»”]+$/;

export function extraerPrimeraUrl(texto: string): string | null {
  const coincidencia = PATRON_URL.exec(texto);
  if (!coincidencia) return null;
  return coincidencia[0].replace(PUNTUACION_FINAL, "");
}

// Idempotente: acepta http(s):// y hxxp(s):// y no duplica `[.]`.
export function neutralizar(url: string): string {
  return url
    .replace(/^http(s?):\/\//i, "hxxp$1://")
    .replace(/\[\.\]/g, ".")
    .replace(/\./g, "[.]");
}
