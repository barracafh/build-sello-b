import { completar } from "@/lib/ia";
import { leerImagen } from "@/lib/imagen";

// POST multipart con el campo `imagen` → `{ texto }` para que el ciudadano lo
// revise y lo compruebe. No guarda ni registra la imagen ni el texto.
export const POST = (request: Request) => leerImagen(request, completar);
