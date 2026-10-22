import { ruta } from "@/config/sitio";

const ERROR_LECTURA = "No hemos podido leer la imagen. Copia el texto del mensaje y pégalo.";
const ERROR_SIN_TEXTO = "No hemos encontrado texto en la imagen. Copia el mensaje y pégalo.";

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
  }: {
    enviar?: typeof fetch;
    vigente: () => boolean;
    mostrarTexto: (texto: string) => void;
    comprobar: (texto: string) => void;
    mostrarError: (error: string) => void;
  },
) {
  let texto: string | null = null;
  let fallo = ERROR_LECTURA;
  try {
    const cuerpo = new FormData();
    cuerpo.set("imagen", imagen);
    const res = await enviar(ruta("/api/imagen"), { method: "POST", body: cuerpo });
    const datos = await res.json();
    if (res.ok && typeof datos.texto === "string") texto = datos.texto;
    else if (typeof datos.error === "string") fallo = datos.error;
  } catch {
    // Sin red o sin JSON: se queda el mensaje de error por defecto.
  }
  if (!vigente()) return;
  if (texto) {
    mostrarTexto(texto);
    comprobar(texto);
  } else mostrarError(texto === "" ? ERROR_SIN_TEXTO : fallo);
}
