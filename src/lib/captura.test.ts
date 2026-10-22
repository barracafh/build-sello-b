import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { analizarCaptura } from "./captura";

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

function prueba(enviar: typeof fetch, vigente = () => true) {
  const llamadas = { texto: [] as string[], comprobar: [] as string[], error: [] as string[] };
  const hecho = analizarCaptura(imagen, {
    enviar,
    vigente,
    mostrarTexto: (texto) => llamadas.texto.push(texto),
    comprobar: (texto) => llamadas.comprobar.push(texto),
    mostrarError: (error) => llamadas.error.push(error),
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

  test("si falla la lectura, enseña el error del servidor y no comprueba", async () => {
    const { enviar } = servidor(() => Response.json({ error: "La imagen es demasiado grande." }, { status: 413 }));
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.deepEqual(llamadas.comprobar, []);
    assert.deepEqual(llamadas.error, ["La imagen es demasiado grande."]);
  });

  test("sin red, enseña el error por defecto y no comprueba", async () => {
    const { enviar } = servidor(() => Promise.reject(new TypeError("Failed to fetch")));
    const { llamadas, hecho } = prueba(enviar);
    await hecho;
    assert.deepEqual(llamadas.comprobar, []);
    assert.match(llamadas.error[0], /No hemos podido leer la imagen/);
  });

  test("si el mensaje cambió mientras leía, no toca nada", async () => {
    const { enviar } = servidor(() => Response.json({ texto: "Mensaje viejo" }));
    const { llamadas, hecho } = prueba(enviar, () => false);
    await hecho;
    assert.deepEqual(llamadas, { texto: [], comprobar: [], error: [] });
  });
});
