import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ficha from "../../ficha.json";

// Next sirve src/app/icon.svg bajo el basePath y emite su <link rel="icon">.
// Sin él, el navegador pide /favicon.ico en la raíz del dominio y da 404.
const ICONO = join(import.meta.dirname, "icon.svg");

describe("icon.svg", () => {
  test("existe en src/app", () => {
    assert.ok(existsSync(ICONO));
  });

  test("es un SVG cuadrado con el icono de la ficha", () => {
    const svg = readFileSync(ICONO, "utf8");
    assert.match(svg, /^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /viewBox="0 0 (\d+) \1"/);
    assert.ok(svg.trimEnd().endsWith("</svg>"));
    assert.ok(svg.includes(`>${ficha.icono}</text>`));
  });
});
