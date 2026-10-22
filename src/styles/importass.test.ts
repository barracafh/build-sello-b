// El design system Import@ss vive en dos sitios: docs/design-system.md y
// src/styles/importass.css. Estas pruebas los mantienen iguales y comprueban
// que los pares de color documentados cumplen el contraste que prometen.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const doc = readFileSync("docs/design-system.md", "utf8");
const css = readFileSync("src/styles/importass.css", "utf8");

/** Tokens de las tablas del documento: `| `--iss-x` | `valor` | …`. Las filas
 *  de pares de contraste (`| `--iss-x` | `--iss-y` | …`) no son definiciones. */
function tokensDelDoc(): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const m of doc.matchAll(/^\|\s*`(--iss-[\w-]+)`\s*\|\s*`([^`]+)`\s*\|/gm)) {
    if (m[2].startsWith("--iss-")) continue;
    tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

/** Declaraciones `--iss-x: valor;` del bloque :root del CSS. */
function tokensDelCss(): Map<string, string> {
  const tokens = new Map<string, string>();
  const root = css.slice(css.indexOf(":root"));
  for (const m of root.matchAll(/(--iss-[\w-]+):\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].replace(/\s+/g, " ").trim());
  }
  return tokens;
}

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

describe("design system Import@ss", () => {
  const doc = tokensDelDoc();
  const css = tokensDelCss();

  test("el documento define tokens", () => {
    assert.ok(doc.size > 40, `solo ${doc.size} tokens`);
  });

  test("cada token del documento existe en el CSS con el mismo valor", () => {
    const distintos = [...doc].filter(([nombre, valor]) => css.get(nombre) !== valor);
    assert.deepEqual(distintos, []);
  });

  test("cada token del CSS está documentado", () => {
    const sinDocumentar = [...css.keys()].filter((nombre) => !doc.has(nombre));
    assert.deepEqual(sinDocumentar, []);
  });

  test("los pares texto/fondo documentados cumplen AA", () => {
    const tabla = readFileSync("docs/design-system.md", "utf8").split("<!-- pares-contraste -->")[1];
    assert.ok(tabla, "falta la marca <!-- pares-contraste -->");
    const filas = [
      ...tabla!.matchAll(/^\|\s*`(--iss-[\w-]+)`\s*\|\s*`(--iss-[\w-]+)`\s*\|\s*([\d.]+):1\s*\|\s*(texto|grande|ui)\s*\|/gm),
    ];
    assert.ok(filas.length > 15, `solo ${filas.length} pares`);
    for (const [, texto, fondo, ratio, tipo] of filas) {
      const real = contraste(css.get(texto)!, css.get(fondo)!);
      const minimo = tipo === "texto" ? 4.5 : 3;
      assert.ok(real >= minimo, `${texto} / ${fondo}: ${real.toFixed(2)}:1 < ${minimo}:1`);
      assert.ok(Math.abs(real - Number(ratio)) < 0.006, `${texto} / ${fondo}: documentado ${ratio}, real ${real.toFixed(2)}`);
    }
  });
});
