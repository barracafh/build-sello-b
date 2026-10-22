import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mostrarCasosTest } from "./casos-test";

describe("mostrarCasosTest", () => {
  test("sin el parámetro, el panel no sale", () => {
    assert.equal(mostrarCasosTest(undefined), false);
  });

  test("solo =true y =1 lo enseñan", () => {
    assert.equal(mostrarCasosTest("true"), true);
    assert.equal(mostrarCasosTest("1"), true);
  });

  test("=false, =0, vacío o cualquier otro valor lo ocultan", () => {
    for (const valor of ["false", "0", "", "si", "TRUE"]) {
      assert.equal(mostrarCasosTest(valor), false, valor);
    }
  });

  test("si se repite, decide el primer valor", () => {
    assert.equal(mostrarCasosTest(["true", "false"]), true);
    assert.equal(mostrarCasosTest(["false", "true"]), false);
  });
});
