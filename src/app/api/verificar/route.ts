import { analizar } from "@/lib/analizar";
import { IDIOMA_POR_DEFECTO, esIdioma } from "@/i18n";
import { aplicarDesmentidos, buscarDesmentidos, consultaDesmentido } from "@/lib/factcheck";

const LIMITE = 2000;

const error = (mensaje: string) =>
  Response.json({ error: mensaje }, { status: 400 });

// Valida la entrada, verifica la URL y, si es un mensaje, lo clasifica con una
// sola llamada al modelo. No guarda ni registra el texto.
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

  // Opcional: el idioma del `motivo`. Si no es uno de los cinco, castellano.
  const pedido = (cuerpo as { idioma?: unknown }).idioma;
  const idioma = esIdioma(pedido) ? pedido : IDIOMA_POR_DEFECTO;

  // Marcadores hasta que existan Safe Browsing y RDAP.
  const analisis = await analizar(texto, { idioma });
  // Después del veredicto final: un desmentido solo lo apoya, nunca lo cambia.
  const desmentidos = await buscarDesmentidos(consultaDesmentido(texto, analisis));
  return Response.json({
    ...analisis,
    ...aplicarDesmentidos(analisis, desmentidos),
    desmentidos,
    reputacion: "no_consultada",
    rdap: "no_disponible",
  });
}
