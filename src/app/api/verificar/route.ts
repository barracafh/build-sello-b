import { extraerPrimeraUrl, neutralizar } from "@/lib/url";

const LIMITE = 2000;

const error = (mensaje: string) =>
  Response.json({ error: mensaje }, { status: 400 });

// V1: valida la entrada y responde con la duda. No guarda ni registra el texto.
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

  const url = extraerPrimeraUrl(texto);
  return Response.json({
    veredicto: "no_determinable",
    motivo: "Análisis pendiente",
    url_analizada: url ? neutralizar(url) : null,
  });
}
