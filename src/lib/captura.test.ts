import { DICCIONARIOS, type Idioma } from "@/i18n";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { LADO_MAX, analizarCaptura, medidasReducidas } from "./captura";

const imagen = new File([new Uint8Array([1, 2, 3])], "captura.png", { type: "image/png" });

// Simula /api/imagen y anota cada URL pedida.
function servidor(responder: () => Response | Promise<Response>) {
  const urls: string[] = [];
  const enviar = (async (url: string | URL | Request) => {
    urls.push(String(url));
    return responder();
  }) as typeof fetch;
  return { urls, enviar };
}

function prueba(
  enviar: typeof fetch,
  vigente = () => true,
  idioma?: Idioma,
  reducir: (imagen: File) => Promise<File> = async (imagen) => imagen,
) {
  const llamadas = { texto: [] as string[], comprobar: [] as string[], error: [] as string[] };
  const hecho = analizarCaptura(imagen, {
    enviar,
    reducir,
    vigente,
    mostrarTexto: (texto) => llamadas.texto.push(texto),
    comprobar: (texto) => llamadas.comprobar.push(texto),
    mostrarError: (error) => llamadas.error.push(error),
    idioma,
  });
  return { llamadas, hecho };
}

describe("analizarCaptura", () => {
  test("con texto, lo pone en el campo y lo comprueba una sola vez", async () => {
    const { urls, enviar } = servidor(() => Response.json({ texto: "Tu paquete está retenido" }));
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.equal(urls.length, 1);
    assert.match(urls[0], /\/api\/imagen$/);
    assert.deepEqual(llamadas.texto, ["Tu paquete está retenido"]);
    assert.deepEqual(llamadas.comprobar, ["Tu paquete está retenido"]);
    assert.deepEqual(llamadas.error, []);
  });

  test("sin texto en la imagen, avisa y no comprueba", async () => {
    const { enviar } = servidor(() => Response.json({ texto: "" }));
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.deepEqual(llamadas.comprobar, []);
    assert.deepEqual(llamadas.texto, []);
    assert.match(llamadas.error[0], /No hemos encontrado texto en la imagen/);
  });

  // El servidor manda un `codigo` (LAB-68): el texto sale del diccionario del idioma.
  test("si falla la lectura, enseña el error del servidor y no comprueba", async () => {
    const { enviar } = servidor(() =>
      Response.json({ error: "La imagen ocupa más de 4 MB.", codigo: "grande" }, { status: 400 }),
    );
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.deepEqual(llamadas.comprobar, []);
    assert.deepEqual(llamadas.error, ["La imagen ocupa más de 4 MB."]);
  });

  test("el error sale en el idioma elegido", async () => {
    const { enviar } = servidor(() =>
      Response.json({ error: "La imagen ocupa más de 4 MB.", codigo: "grande" }, { status: 400 }),
    );
    const { llamadas, hecho } = prueba(enviar, () => true, "eu");
    await hecho;
    assert.deepEqual(llamadas.error, [DICCIONARIOS.eu.errores.imagen.grande]);
  });

  test("sin red, enseña el error por defecto y no comprueba", async () => {
    const { enviar } = servidor(() => Promise.reject(new TypeError("Failed to fetch")));
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.deepEqual(llamadas.comprobar, []);
    assert.match(llamadas.error[0], /No hemos podido leer la imagen/);
  });

  // LAB-78: una captura enorme se reduce en el navegador antes de subirla.
  test("sube la imagen reducida, no la original", async () => {
    const reducida = new File([new Uint8Array([9])], "reducida.png", { type: "image/png" });
    let subida: FormDataEntryValue | null = null;
    const enviar = (async (_url: string | URL | Request, init?: RequestInit) => {
      subida = (init?.body as FormData).get("imagen");
      return Response.json({ texto: "Hola" });
    }) as typeof fetch;
    const { hecho } = prueba(enviar, () => true, undefined, async (original) => {
      assert.equal(original, imagen);
      return reducida;
    });
    await hecho;
    assert.equal((subida as File | null)?.name, "reducida.png");
    assert.equal((subida as File | null)?.size, reducida.size);
  });

  test("si reducir falla, sube la original", async () => {
    let subida: FormDataEntryValue | null = null;
    const enviar = (async (_url: string | URL | Request, init?: RequestInit) => {
      subida = (init?.body as FormData).get("imagen");
      return Response.json({ texto: "Hola" });
    }) as typeof fetch;
    const { llamadas, hecho } = prueba(enviar, () => true, undefined, async () => {
      throw new Error("sin canvas");
    });
    await hecho;
    assert.equal((subida as File | null)?.name, imagen.name);
    assert.equal((subida as File | null)?.size, imagen.size);
    assert.deepEqual(llamadas.comprobar, ["Hola"]);
  });

  test("si el mensaje cambió mientras leía, no toca nada", async () => {
    const { enviar } = servidor(() => Response.json({ texto: "Mensaje viejo" }));
    const { llamadas, hecho } = prueba(enviar, () => false);
    await hecho;
    assert.deepEqual(llamadas, { texto: [], comprobar: [], error: [] });
  });
});

describe("medidasReducidas", () => {
  test("lleva el lado largo a 2.000 px", () => {
    assert.equal(LADO_MAX, 2000);
    assert.deepEqual(medidasReducidas(8000, 8000), { ancho: 2000, alto: 2000 });
    assert.deepEqual(medidasReducidas(1080, 6000), { ancho: 360, alto: 2000 });
  });

  test("no toca una imagen que ya cabe", () => {
    assert.deepEqual(medidasReducidas(1280, 900), { ancho: 1280, alto: 900 });
    assert.deepEqual(medidasReducidas(2000, 1500), { ancho: 2000, alto: 1500 });
  });
});
