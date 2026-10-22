import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { leerFragmentos, neutralizarTexto, rangosDeUrl, trozos } from "./trozos";

describe("neutralizarTexto", () => {
  test("neutraliza URLs con esquema y dominios sueltos, y deja el resto", () => {
    assert.equal(
      neutralizarTexto("Pague en https://dgt-multas.top/x. O en www.correos.es, gracias."),
      "Pague en hxxps://dgt-multas[.]top/x. O en www[.]correos[.]es, gracias.",
    );
  });
  test("es idempotente con lo ya neutralizado", () => {
    assert.equal(neutralizarTexto("hxxps://a-b[.]com/x"), "hxxps://a-b[.]com/x");
  });
  test("no toca cifras ni frases con punto", () => {
    assert.equal(neutralizarTexto("Pague 1.500 € en 2023. mas info"), "Pague 1.500 € en 2023. mas info");
  });
});

describe("rangosDeUrl", () => {
  test("sin la puntuación final", () => {
    const texto = "Entre en sede.dgt.gob.es.";
    const [r] = rangosDeUrl(texto);
    assert.equal(texto.slice(r.inicio, r.fin), "sede.dgt.gob.es");
  });
});

describe("trozos", () => {
  const texto = "DGT: pague ya en https://dgt-multas.top/x hoy";

  test("una URL dentro de un rango sale neutralizada", () => {
    const inicio = texto.indexOf("pague");
    const t = trozos(texto, [{ inicio, fin: texto.indexOf(" hoy"), nivel: "roja", codigo: "pide_dinero" }]);
    assert.deepEqual(t, [
      { texto: "DGT: ", nivel: null, codigo: null },
      { texto: "pague ya en hxxps://dgt-multas[.]top/x", nivel: "roja", codigo: "pide_dinero" },
      { texto: " hoy", nivel: null, codigo: null },
    ]);
  });

  test("una URL fuera de los rangos también sale neutralizada", () => {
    const t = trozos(texto, []);
    assert.equal(t.map((x) => x.texto).join(""), "DGT: pague ya en hxxps://dgt-multas[.]top/x hoy");
  });

  test("ignora rangos fuera del texto o solapados", () => {
    const t = trozos("abcdef", [
      { inicio: 0, fin: 3, nivel: "roja", codigo: "a" },
      { inicio: 2, fin: 4, nivel: "naranja", codigo: "b" },
      { inicio: 4, fin: 40, nivel: "naranja", codigo: "c" },
    ]);
    assert.deepEqual(t.map((x) => [x.texto, x.nivel]), [["abc", "roja"], ["def", null]]);
  });
});

describe("leerFragmentos", () => {
  test("descarta lo que no es un rango válido", () => {
    const fs = leerFragmentos(
      [
        { inicio: 0, fin: 2, nivel: "roja", codigo: "x" },
        { inicio: 2, fin: 2, nivel: "roja", codigo: "x" },
        { inicio: 0, fin: 2, nivel: "azul", codigo: "x" },
        { inicio: "0", fin: 2, nivel: "roja", codigo: "x" },
        null,
      ],
      10,
    );
    assert.equal(fs.length, 1);
    assert.deepEqual(leerFragmentos("nada"), []);
  });
});
