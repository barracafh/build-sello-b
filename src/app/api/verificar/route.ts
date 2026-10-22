import { combinar, senales } from "@/lib/senales";
import { verificar } from "@/lib/verificar";

const LIMITE = 2000;

const error = (mensaje: string) =>
  Response.json({ error: mensaje }, { status: 400 });

// Valida la entrada y verifica la URL. No guarda ni registra el texto.
export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    // `request.text()` + JSON.parse: `curl -d` envía un content-type de formulario.
    cuerpo = JSON.parse(await request.text());
  } catch {
    return error("JSON no válido");
  }

  const texto = (cuerpo as { texto?: unknown } | null)?.texto;
  if (typeof texto !== "string") return error("«texto» debe ser una cadena");
  if (texto.trim().length === 0) return error("«texto» está vacío");
  if (texto.length > LIMITE) return error("«texto» supera los 2.000 caracteres");

  // Marcadores hasta que existan Safe Browsing y RDAP.
  const url = verificar(texto);
  const lista = senales(texto, url);
  return Response.json({
    ...combinar(url, lista, texto),
    senales: lista,
    reputacion: "no_consultada",
    rdap: "no_disponible",
  });
}
