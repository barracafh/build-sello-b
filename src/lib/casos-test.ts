// ?casos-test decide si se enseña el panel de ejemplos. Hasta producción se
// enseña por defecto; solo ?casos-test=false o =0 lo ocultan. Si el parámetro
// se repite, decide el primer valor.
// TODO(prod): volver a ocultarlo por defecto antes de ir a producción.
export function mostrarCasosTest(param: string | string[] | undefined): boolean {
  const valor = Array.isArray(param) ? param[0] : param;
  return valor !== "false" && valor !== "0";
}
