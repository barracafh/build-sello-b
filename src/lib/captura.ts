import { ruta } from "@/config/sitio";
import { diccionario, type Diccionario, type Idioma } from "@/i18n";

// Una captura va a /api/imagen, que devuelve su texto; la imagen no se guarda.
// Si hay texto, se pone en el campo y se comprueba sin pulsar el botón (LAB-71):
// una sola llamada a /api/verificar por imagen. Sin texto o con un fallo, solo
// se avisa. `vigente` descarta la lectura si el mensaje cambió mientras tanto.
export async function analizarCaptura(
  imagen: File,
  {
    enviar = fetch,
    vigente,
    mostrarTexto,
    comprobar,
    mostrarError,
    idioma = "es",
  }: {
    enviar?: typeof fetch;
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
    cuerpo.set("imagen", imagen);
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
