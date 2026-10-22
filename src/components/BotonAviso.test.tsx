import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { BotonAviso } from "./BotonAviso";
import { site } from "@/config/sitio";

// La regla del proyecto pide el componente <BotonAviso /> en el pie, no una copia del enlace.
const PIE = join(import.meta.dirname, "Pie.tsx");

describe("BotonAviso", () => {
  test("enlaza con la página de avisos", () => {
    const html = renderToStaticMarkup(<BotonAviso />);
    assert.match(html, new RegExp(`href="${site.feedbackUrl}"`));
    assert.match(html, /¿Algo está mal\? Avísanos/);
  });

  test("admite clases extra para colocarlo", () => {
    const html = renderToStaticMarkup(<BotonAviso className="mt-4" />);
    assert.match(html, /class="[^"]*\bmt-4\b/);
  });

  test("el pie lo pinta en vez de copiar el enlace", () => {
    const pie = readFileSync(PIE, "utf8");
    assert.match(pie, /<BotonAviso\b[^>]*\/>/);
    assert.doesNotMatch(pie, /site\.feedbackUrl/);
  });
});
