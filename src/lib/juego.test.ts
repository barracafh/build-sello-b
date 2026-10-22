import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { es } from "@/i18n/es";
import { RONDAS, UMBRAL_DESLIZAR, barajar, fuenteDe, respuestaDeArrastre, valoracion } from "./juego";

describe("RONDAS", () => {
  test("son los 10 ejemplos: 5 estafas y 5 de verdad", () => {
    assert.equal(RONDAS.length, 10);
    assert.equal(RONDAS.filter((r) => r.esEstafa).length, 5);
  });

  test("ninguna dirección va viva", () => {
    for (const r of RONDAS) {
      if (r.direccion) assert.doesNotMatch(r.direccion, /^https?:|\.(?![^[]*\])/, r.id);
    }
  });

  test("cada una tiene web oficial de la lista y fuente https", () => {
    for (const r of RONDAS) {
      assert.ok(r.web, r.id);
      assert.match(r.fuente.url, /^https:\/\//, r.id);
    }
  });

  test("las estafas citan el aviso de INCIBE", () => {
    for (const r of RONDAS.filter((x) => x.esEstafa)) {
      assert.match(fuenteDe(r, es).nombre, /^INCIBE · /, r.id);
    }
  });
});

test("barajar no pierde ni repite tarjetas", () => {
  let semilla = 1;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const barajadas = barajar(RONDAS, azar);
  assert.deepEqual(barajadas.map((r) => r.id).sort(), RONDAS.map((r) => r.id).sort());
});

test("respuestaDeArrastre: izquierda es estafa, derecha de verdad", () => {
  assert.equal(respuestaDeArrastre(-UMBRAL_DESLIZAR), true);
  assert.equal(respuestaDeArrastre(UMBRAL_DESLIZAR + 5), false);
  assert.equal(respuestaDeArrastre(40), null);
  assert.equal(respuestaDeArrastre(-40), null);
});

test("valoracion", () => {
  assert.equal(valoracion(10, 10), "perfecto");
  assert.equal(valoracion(8, 10), "muyBien");
  assert.equal(valoracion(5, 10), "noEstaMal");
  assert.equal(valoracion(3, 10), "repasa");
});
