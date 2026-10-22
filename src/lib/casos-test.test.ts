import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mostrarCasosTest } from "./casos-test";

describe("mostrarCasosTest", () => {
  test("sin el parámetro, el panel se enseña", () => {
    assert.equal(mostrarCasosTest(undefined), true);
  });

  test("vacío o con cualquier otro valor, se enseña", () => {
    assert.equal(mostrarCasosTest(""), true);
    assert.equal(mostrarCasosTest("1"), true);
  });

  test("solo =false y =0 lo ocultan", () => {
    assert.equal(mostrarCasosTest("false"), false);
    assert.equal(mostrarCasosTest("0"), false);
  });

  test("si se repite, decide el primer valor", () => {
    assert.equal(mostrarCasosTest(["false", "1"]), false);
    assert.equal(mostrarCasosTest(["1", "false"]), true);
  });
});
