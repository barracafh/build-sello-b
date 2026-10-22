import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { elegirPuerto, puertoEstable } from "./puerto";

test("puertoEstable da el mismo puerto para la misma ruta", () => {
  assert.equal(puertoEstable("/a/worktree"), puertoEstable("/a/worktree"));
});

test("puertoEstable queda dentro del rango 3100-3199", () => {
  for (const ruta of ["/a", "/b/c", "/x/y/z", "/Users/edu/repo"]) {
    const puerto = puertoEstable(ruta);
    assert.ok(puerto >= 3100 && puerto <= 3199, `${ruta} → ${puerto}`);
  }
});

test("puertoEstable reparte rutas distintas en puertos distintos", () => {
  const puertos = new Set(["/w/uno", "/w/dos", "/w/tres"].map((r) => puertoEstable(r)));
  assert.equal(puertos.size, 3);
});

test("PORT en el entorno siempre gana", async () => {
  assert.equal(await elegirPuerto("/a", { PORT: "4321" }), 4321);
});

test("si el puerto estable está ocupado, toma el siguiente libre", async () => {
  const ruta = "/ocupado/worktree";
  const ocupado = puertoEstable(ruta);
  const servidor = createServer();
  await new Promise<void>((ok) => servidor.listen(ocupado, ok));
  try {
    const puerto = await elegirPuerto(ruta, {});
    assert.notEqual(puerto, ocupado);
    assert.ok(puerto >= 3100 && puerto <= 3199);
  } finally {
    servidor.close();
  }
});
