import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { es } from "@/i18n/es";
import { eu } from "@/i18n/eu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { CargaResultado } from "./CargaResultado";

describe("CargaResultado", () => {
  test("enseña el paso del momento, sin aviso de espera al principio", () => {
    const html = renderToStaticMarkup(<CargaResultado transcurrido={0} />);
    assert.match(html, new RegExp(es.carga.pasos[0]));
    assert.doesNotMatch(html, /unos segundos más/);
  });

  test("si tarda, añade «Esto puede tardar unos segundos más.»", () => {
    const html = renderToStaticMarkup(<CargaResultado transcurrido={5000} />);
    assert.match(html, new RegExp(es.carga.pasos[2]));
    assert.match(html, /Esto puede tardar unos segundos más\./);
  });

  test("sigue el idioma elegido", () => {
    const html = renderToStaticMarkup(<CargaResultado transcurrido={5000} idioma="eu" />);
    assert.match(html, new RegExp(eu.carga.pasos[2]));
    assert.match(html, new RegExp(eu.carga.lenta));
  });

  test("la línea de pasos no es una región viva: no se anuncia cada cambio", () => {
    const html = renderToStaticMarkup(<CargaResultado transcurrido={2000} />);
    assert.doesNotMatch(html, /aria-live|role="status"|role="alert"/);
  });
});

describe("movimiento reducido", () => {
  test("el spinner deja de girar y queda como indicador estático", () => {
    const html = renderToStaticMarkup(<Spinner />);
    assert.match(html, /animate-spin/);
    assert.match(html, /motion-reduce:animate-none/);
    assert.match(html, /aria-hidden="true"/);
  });

  test("el esqueleto no parpadea", () => {
    const html = renderToStaticMarkup(<Skeleton />);
    assert.match(html, /animate-pulse/);
    assert.match(html, /motion-reduce:animate-none/);
    assert.match(html, /aria-hidden="true"/);
  });
});
