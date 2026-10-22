import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { listarModelos } from "./modelos";

describe("listarModelos", () => {
  test("pide GET /models con la clave de ia.ts y devuelve solo los ids", async () => {
    const llamadas: { url: string; init?: RequestInit }[] = [];
    const falso = (async (url: string, init?: RequestInit) => {
      llamadas.push({ url, init });
      return Response.json({ data: [{ id: "b", owned_by: "x" }, { id: "a" }] });
    }) as typeof fetch;
    const ids = await listarModelos({ clave: "CLAVE-SECRETA", base: "https://h.test/v1", fetch: falso });
    assert.deepEqual(ids, ["a", "b"]);
    assert.equal(llamadas[0].url, "https://h.test/v1/models");
    assert.equal(new Headers(llamadas[0].init?.headers).get("authorization"), "Bearer CLAVE-SECRETA");
    assert.ok(!ids.join().includes("CLAVE-SECRETA"));
  });

  test("un error de HelmCode no cita la clave", async () => {
    const falso = (async () => new Response("no", { status: 401 })) as unknown as typeof fetch;
    await assert.rejects(
      listarModelos({ clave: "CLAVE-SECRETA", base: "https://h.test/v1", fetch: falso }),
      (e: Error) => e.message === "HelmCode respondió 401",
    );
  });
});
