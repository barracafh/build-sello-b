import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ficha from "../../ficha.json";
import { MARCA } from "@/components/Marca";

// Next sirve src/app/icon.svg bajo el basePath y emite su <link rel="icon">.
// Sin él, el navegador pide /favicon.ico en la raíz del dominio y da 404.
const ICONO = join(import.meta.dirname, "icon.svg");

describe("icon.svg", () => {
  test("existe en src/app", () => {
    assert.ok(existsSync(ICONO));
  });

  test("es un SVG cuadrado", () => {
    const svg = readFileSync(ICONO, "utf8");
    assert.match(svg, /^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /viewBox="0 0 (\d+) \1"/);
    assert.ok(svg.trimEnd().endsWith("</svg>"));
  });

  // El favicon no puede leer CSS: repite a mano la letra de <Marca />.
  test("dibuja la misma marca que la cabecera", () => {
    const svg = readFileSync(ICONO, "utf8");
    assert.ok(svg.includes(`d="${MARCA.letra}"`));
  });

  test("la marca es el icono de la ficha", () => {
    assert.equal(MARCA.caracter, ficha.icono);
  });
});
