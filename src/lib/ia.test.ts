import { test } from "node:test";
import assert from "node:assert/strict";
import { completar, textoDeRespuesta } from "./ia";

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

test("con `razonar: false` pide el modelo sin razonamiento; sin él, no añade nada", async () => {
  const fetchReal = globalThis.fetch;
  const entorno = { ...process.env };
  const cuerpos: Record<string, unknown>[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    cuerpos.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify(respuesta({ content: "{}" })));
  }) as typeof fetch;
  process.env.HELMCODE_API_KEY = "k";
  process.env.HELMCODE_MODEL = "m";
  try {
    await completar([{ role: "user", content: "hola" }], { razonar: false });
    await completar([{ role: "user", content: "hola" }]);
  } finally {
    globalThis.fetch = fetchReal;
    process.env = entorno;
  }
  assert.deepEqual(cuerpos[0].thinking, { type: "disabled" });
  assert.equal("thinking" in cuerpos[1], false);
});
