import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { es } from "@/i18n/es";
import { AVISO_LENTO_MS, MINIMO_MS, esLenta, esperaAntesDeMostrar, pasoEn } from "./carga";

const PASOS = es.carga.pasos;

describe("pasoEn", () => {
  test("avanza por los pasos y se queda en el último", () => {
    assert.equal(pasoEn(0, PASOS), PASOS[0]);
    assert.equal(pasoEn(1600, PASOS), PASOS[1]);
    assert.equal(pasoEn(3200, PASOS), PASOS[2]);
    assert.equal(pasoEn(60_000, PASOS), PASOS[2]);
  });

  test("no promete porcentajes", () => {
    for (const paso of PASOS) assert.doesNotMatch(paso, /\d|%/);
  });
});

describe("esLenta", () => {
  test("a partir de unos 4 s avisa de que tarda", () => {
    assert.equal(esLenta(AVISO_LENTO_MS - 1), false);
    assert.equal(esLenta(AVISO_LENTO_MS), true);
  });
});

describe("esperaAntesDeMostrar", () => {
  test("sin esqueleto en pantalla, el resultado sale ya (respuesta rápida, sin parpadeo)", () => {
    assert.equal(esperaAntesDeMostrar(null, 1000), 0);
  });

  test("con esqueleto, se mantiene al menos MINIMO_MS", () => {
    assert.equal(esperaAntesDeMostrar(1000, 1100), MINIMO_MS - 100);
    assert.equal(esperaAntesDeMostrar(1000, 1000 + MINIMO_MS + 50), 0);
  });
});
