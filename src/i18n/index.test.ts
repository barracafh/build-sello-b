import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ficha from "../../ficha.json";
import { DICCIONARIOS, IDIOMAS, NOMBRES, langHtml, resolverIdioma } from "./index";

describe("resolverIdioma", () => {
  test("?lang manda sobre Accept-Language", () => {
    assert.equal(resolverIdioma("eu", "ca-ES,ca;q=0.9"), "eu");
  });

  test("?lang desconocido o vacío cae a Accept-Language", () => {
    assert.equal(resolverIdioma("fr", "gl-ES,gl;q=0.9"), "gl");
    assert.equal(resolverIdioma("", "gl"), "gl");
  });

  test("si ?lang se repite, decide el primer valor", () => {
    assert.equal(resolverIdioma(["ca", "eu"], null), "ca");
  });

  test("?lang no distingue mayúsculas", () => {
    assert.equal(resolverIdioma("CA", null), "ca");
  });

  test("Accept-Language toma el primero de los cinco por orden de q", () => {
    assert.equal(resolverIdioma(undefined, "en-GB,en;q=0.9,eu;q=0.8,ca;q=0.7"), "eu");
    assert.equal(resolverIdioma(undefined, "en;q=0.5,ca;q=0.9"), "ca");
  });

  test("ca-ES-valencia es valencià", () => {
    assert.equal(resolverIdioma(undefined, "ca-ES-valencia,ca;q=0.9"), "va");
    assert.equal(resolverIdioma(undefined, "ca-valencia"), "va");
  });

  test("ignora idiomas con q=0", () => {
    assert.equal(resolverIdioma(undefined, "ca;q=0,gl;q=0.5"), "gl");
  });

  test("sin nada que encaje, castellano", () => {
    assert.equal(resolverIdioma(undefined, null), "es");
    assert.equal(resolverIdioma(undefined, "en-US,fr;q=0.8"), "es");
    assert.equal(resolverIdioma(undefined, ""), "es");
  });
});

describe("idiomas", () => {
  test("son los cinco oficiales, castellano primero", () => {
    assert.deepEqual([...IDIOMAS], ["es", "ca", "va", "gl", "eu"]);
  });

  test("cada idioma se nombra en sí mismo", () => {
    assert.deepEqual(NOMBRES, {
      es: "Castellano",
      ca: "Català",
      va: "Valencià",
      gl: "Galego",
      eu: "Euskara",
    });
  });

  test("<html lang> usa la etiqueta BCP 47 de valencià", () => {
    assert.deepEqual(
      IDIOMAS.map((idioma) => langHtml(idioma)),
      ["es", "ca", "ca-ES-valencia", "gl", "eu"],
    );
  });
});

// Recorre el diccionario y devuelve las rutas de sus hojas, p. ej. "pie.aviso".
const claves = (objeto: object, prefijo = ""): string[] =>
  Object.entries(objeto).flatMap(([clave, valor]) =>
    valor && typeof valor === "object"
      ? claves(valor, `${prefijo}${clave}.`)
      : [`${prefijo}${clave}`],
  );

describe("diccionarios", () => {
  test("la frase de la cabecera en castellano es la de ficha.json", () => {
    assert.equal(DICCIONARIOS.es.cabecera.frase, ficha.frase);
  });

  test("todos tienen las mismas claves que es", () => {
    const base = claves(DICCIONARIOS.es).sort();
    for (const idioma of IDIOMAS) assert.deepEqual(claves(DICCIONARIOS[idioma]).sort(), base);
  });

  test("ningún texto está vacío", () => {
    for (const idioma of IDIOMAS) {
      const vacias = claves(DICCIONARIOS[idioma]).filter((ruta) => {
        const valor = ruta.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], DICCIONARIOS[idioma]);
        return typeof valor === "string" && !valor.trim();
      });
      assert.deepEqual(vacias, []);
    }
  });

  test("el aviso obligatorio aparece en todos", () => {
    for (const idioma of IDIOMAS) assert.ok(DICCIONARIOS[idioma].pie.aviso.length > 0);
    assert.equal(DICCIONARIOS.es.pie.aviso, "Herramienta experimental. No es un servicio oficial.");
  });
});
