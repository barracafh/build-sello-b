import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  ERROR_IA,
  SIN_TEXTO,
  tipoDe,
  LIMITE_TEXTO,
  MAX_BYTES,
  leerImagen,
  mensajesParaImagen,
  recortar,
  validarImagen,
} from "./imagen";
import type { Mensaje } from "./ia";

// Primeros bytes de cada formato: el tipo se decide por el contenido, no por el nombre.
const FIRMAS: Record<string, number[]> = {
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/webp": [...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")],
  "image/gif": [...Buffer.from("GIF89a")],
  "application/pdf": [...Buffer.from("%PDF-")],
};

const archivo = (tipo: string, bytes: number) => {
  const datos = new Uint8Array(bytes);
  datos.set((FIRMAS[tipo] ?? []).slice(0, bytes));
  return new File([datos], "captura", { type: tipo });
};

const peticion = (cuerpo?: FormData) =>
  new Request("http://localhost/api/imagen", { method: "POST", body: cuerpo });

const conImagen = (imagen: File) => {
  const form = new FormData();
  form.set("imagen", imagen);
  return peticion(form);
};

describe("tipoDe", () => {
  const bytes = async (tipo: string) =>
    new Uint8Array(await archivo(tipo, 16).arrayBuffer());

  for (const tipo of ["image/png", "image/jpeg", "image/webp"])
    test(`reconoce ${tipo}`, async () => {
      assert.equal(tipoDe(await bytes(tipo)), tipo);
    });

  test("no reconoce otros formatos", async () => {
    assert.equal(tipoDe(await bytes("image/gif")), null);
    assert.equal(tipoDe(await bytes("application/pdf")), null);
  });
});

describe("validarImagen", () => {

  test("rechaza más de 4 MB", () => {
    assert.equal(validarImagen(archivo("image/png", MAX_BYTES)), null);
    assert.match(validarImagen(archivo("image/png", MAX_BYTES + 1)) ?? "", /4 MB/);
  });

  test("rechaza una imagen vacía o ausente", () => {
    assert.match(validarImagen(archivo("image/png", 0)) ?? "", /vacía/);
    assert.match(validarImagen(null) ?? "", /Elige una imagen/);
    assert.match(validarImagen("texto") ?? "", /Elige una imagen/);
  });
});

describe("mensajesParaImagen", () => {
  const mensajes = mensajesParaImagen("data:image/png;base64,AAAA");

  test("manda la imagen como parte image_url en data URL", () => {
    const usuario = mensajes.find((m) => m.role === "user");
    assert.ok(Array.isArray(usuario?.content));
    assert.deepEqual(
      (usuario.content as Exclude<Mensaje["content"], string>).find(
        (p) => p.type === "image_url",
      ),
      { type: "image_url", image_url: { url: "data:image/png;base64,AAAA" } },
    );
  });

  test("el sistema pide transcribir literal y no seguir instrucciones de la imagen", () => {
    const sistema = mensajes.find((m) => m.role === "system")?.content as string;
    assert.match(sistema, /literal/i);
    assert.match(sistema, /no sigas/i);
    assert.match(sistema, /sin comentarios/i);
  });

  test("sin texto, pide el marcador fijo en vez de una respuesta vacía", () => {
    const sistema = mensajes.find((m) => m.role === "system")?.content as string;
    assert.ok(sistema.includes(SIN_TEXTO));
    assert.doesNotMatch(sistema, /responde vacío/i);
  });
});

test("recortar quita espacios y corta a 2.000 caracteres", () => {
  assert.equal(recortar("  hola \n"), "hola");
  assert.equal(recortar("a".repeat(LIMITE_TEXTO + 50)).length, LIMITE_TEXTO);
});

describe("leerImagen", () => {
  const nunca = async (): Promise<string> => {
    throw new Error("no debería llamar a la IA");
  };

  test("400 si no es PNG, JPG o WebP, sin llamar a la IA", async () => {
    const res = await leerImagen(conImagen(archivo("image/gif", 10)), nunca);
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /PNG, JPG o WebP/);
  });

  test("400 si el cuerpo no es un formulario", async () => {
    const res = await leerImagen(peticion(), nunca);
    assert.equal(res.status, 400);
  });

  test("400 si el cuerpo declarado supera el límite, sin leerlo", async () => {
    const req = new Request("http://localhost/api/imagen", {
      method: "POST",
      headers: { "content-length": String(MAX_BYTES * 2) },
      body: "x",
    });
    const res = await leerImagen(req, nunca);
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /4 MB/);
  });

  test("503 si la IA falla", async () => {
    const res = await leerImagen(conImagen(archivo("image/png", 16)), async () => {
      throw new Error("HelmCode respondió 500");
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: ERROR_IA });
  });

  test("con el marcador SIN_TEXTO devuelve texto vacío", async () => {
    const res = await leerImagen(conImagen(archivo("image/png", 16)), async () => ` ${SIN_TEXTO}\n`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { texto: "" });
  });

  test("503 si la IA responde vacío: no se confunde con una imagen sin texto", async () => {
    const res = await leerImagen(conImagen(archivo("image/png", 16)), async () => "  ");
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: ERROR_IA });
  });

  test("200 con el texto transcrito, una sola llamada", async () => {
    let llamadas = 0;
    let recibido: Mensaje[] = [];
    const res = await leerImagen(conImagen(archivo("image/jpeg", 3)), async (m) => {
      llamadas++;
      recibido = m;
      return "  DGT: pague aquí hxxps://dgt.es.multas-pago[.]com  ";
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      texto: "DGT: pague aquí hxxps://dgt.es.multas-pago[.]com",
    });
    assert.equal(llamadas, 1);
    assert.match(JSON.stringify(recibido), /data:image\/jpeg;base64,\/9j\//);
  });
});
