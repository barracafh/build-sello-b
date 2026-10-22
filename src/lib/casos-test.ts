// ?casos-test decide si se enseña el panel de ejemplos. Por defecto no sale;
// solo ?casos-test=true (o =1) lo enseña. Si el parámetro se repite, decide
// el primer valor.
export function mostrarCasosTest(param: string | string[] | undefined): boolean {
  const valor = Array.isArray(param) ? param[0] : param;
  return valor === "true" || valor === "1";
}
