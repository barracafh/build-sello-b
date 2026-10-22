import { headers } from "next/headers";
import { CABECERA_IDIOMA, IDIOMA_POR_DEFECTO, esIdioma, type Idioma } from "./index";

// Idioma de la petición, resuelto por src/proxy.ts.
export async function idiomaDePeticion(): Promise<Idioma> {
  const valor = (await headers()).get(CABECERA_IDIOMA);
  return esIdioma(valor) ? valor : IDIOMA_POR_DEFECTO;
}
