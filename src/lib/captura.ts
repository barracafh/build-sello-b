import { ruta } from "@/config/sitio";
import { diccionario, type Diccionario, type Idioma } from "@/i18n";
import { MAX_BYTES } from "./imagen";

// LAB-78: con una captura enorme el modelo la ve reducida y confunde letras de
// los dominios. Se reduce en el navegador para que el servidor no la toque.
export const LADO_MAX = 2000;

/** Medidas con el lado largo en LADO_MAX como mucho; si ya cabe, las mismas. */
export function medidasReducidas(ancho: number, alto: number) {
  const escala = Math.min(1, LADO_MAX / Math.max(ancho, alto));
  return { ancho: Math.round(ancho * escala), alto: Math.round(alto * escala) };
}

/**
 * Reduce la imagen a LADO_MAX en PNG. Solo si hace falta: volver a codificar
 * una imagen pequeña puede hacerla más grande. Sin canvas, o si el PNG pasa de
 * 4 MB, se queda la original.
 */
export async function reducirImagen(imagen: File): Promise<File> {
  try {
    const mapa = await createImageBitmap(imagen);
    try {
      const { ancho, alto } = medidasReducidas(mapa.width, mapa.height);
      if (ancho === mapa.width && alto === mapa.height) return imagen;
      const lienzo = new OffscreenCanvas(ancho, alto);
      const contexto = lienzo.getContext("2d");
      if (!contexto) return imagen;
      contexto.drawImage(mapa, 0, 0, ancho, alto);
      const png = await lienzo.convertToBlob({ type: "image/png" });
      if (png.size > MAX_BYTES) return imagen;
      return new File([png], imagen.name.replace(/\.\w+$/, "") + ".png", { type: "image/png" });
    } finally {
      mapa.close();
    }
  } catch {
    return imagen;
  }
}

// Una captura, reducida si es enorme, va a /api/imagen, que devuelve su texto; la imagen no se guarda.
// Si hay texto, se pone en el campo y se comprueba sin pulsar el botón (LAB-71):
// una sola llamada a /api/verificar por imagen. Sin texto o con un fallo, solo
// se avisa. `vigente` descarta la lectura si el mensaje cambió mientras tanto.
export async function analizarCaptura(
  imagen: File,
  {
    enviar = fetch,
    reducir = reducirImagen,
    vigente,
    mostrarTexto,
    comprobar,
    mostrarError,
    idioma = "es",
  }: {
    enviar?: typeof fetch;
    /** Se inyecta en las pruebas, que no tienen canvas. */
    reducir?: (imagen: File) => Promise<File>;
    vigente: () => boolean;
    mostrarTexto: (texto: string) => void;
    comprobar: (texto: string) => void;
    mostrarError: (error: string) => void;
    /** Idioma de los errores; el servidor manda un `codigo` y el texto sale del diccionario. */
    idioma?: Idioma;
  },
) {
  const errores = diccionario(idioma).errores;
  let texto: string | null = null;
  let fallo: string = errores.imagen.ia;
  try {
    const cuerpo = new FormData();
    cuerpo.set("imagen", await reducir(imagen).catch(() => imagen));
    const res = await enviar(ruta("/api/imagen"), { method: "POST", body: cuerpo });
    const datos = await res.json();
    if (res.ok && typeof datos.texto === "string") texto = datos.texto;
    else if (typeof datos.codigo === "string" && Object.hasOwn(errores.imagen, datos.codigo))
      fallo = errores.imagen[datos.codigo as keyof Diccionario["errores"]["imagen"]];
  } catch {
    // Sin red o sin JSON: se queda el mensaje de error por defecto.
  }
  if (!vigente()) return;
  if (texto) {
    mostrarTexto(texto);
    comprobar(texto);
  } else mostrarError(texto === "" ? errores.imagenSinTexto : fallo);
}
