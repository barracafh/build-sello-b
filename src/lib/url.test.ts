import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { extraerPrimeraUrl, neutralizar } from "./url";

describe("extraerPrimeraUrl", () => {
  test("encuentra una URL en vivo", () => {
    assert.equal(extraerPrimeraUrl("AVISO https://dgt-multas.com/x ya"), "https://dgt-multas.com/x");
  });

  test("encuentra una URL ya neutralizada", () => {
    assert.equal(extraerPrimeraUrl("AVISO hxxps://dgt-multas-pago[.]com/x"), "hxxps://dgt-multas-pago[.]com/x");
  });

  test("devuelve null si no hay URL", () => {
    assert.equal(extraerPrimeraUrl("Hola, ¿qué tal?"), null);
  });

  test("devuelve solo la primera", () => {
    assert.equal(extraerPrimeraUrl("http://a.com y http://b.com"), "http://a.com");
  });
});

describe("neutralizar", () => {
  test("neutraliza una URL en vivo", () => {
    assert.equal(neutralizar("https://ejemplo.com/a.b"), "hxxps://ejemplo[.]com/a[.]b");
    assert.equal(neutralizar("http://ejemplo.com"), "hxxp://ejemplo[.]com");
  });

  test("es idempotente", () => {
    const una = neutralizar("https://ejemplo.com/a.b");
    assert.equal(neutralizar(una), una);
    assert.equal(neutralizar("hxxps://dgt-multas-pago[.]com/x"), "hxxps://dgt-multas-pago[.]com/x");
  });
});
