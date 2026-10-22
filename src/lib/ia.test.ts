import { test } from "node:test";
import assert from "node:assert/strict";
import { textoDeRespuesta } from "./ia";

const respuesta = (message: object) => ({ choices: [{ message }] });

test("devuelve el texto de `content`", () => {
  assert.equal(
    textoDeRespuesta(respuesta({ role: "assistant", content: "DGT: pague aquí" })),
    "DGT: pague aquí",
  );
});

test("falla si `content` es null, en vez de devolver una respuesta vacía", () => {
  assert.throws(() => textoDeRespuesta(respuesta({ role: "assistant", content: null })));
});

// glm5.3-flash devuelve su razonamiento (en inglés) en `reasoning_content`: no es
// la respuesta y no debe llegar al ciudadano aunque `content` venga vacío.
test("no usa el texto de `reasoning_content` como respuesta", () => {
  assert.throws(() =>
    textoDeRespuesta(
      respuesta({ role: "assistant", content: null, reasoning_content: "The user wants me to…" }),
    ),
  );
});

test("falla si no hay `choices`", () => {
  assert.throws(() => textoDeRespuesta({ error: "x" }));
});
