import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { publicar, resolverBase, retirar, urlPreview, type Ejecutar } from "./preview";

const estado = (dns: string) => JSON.stringify({ Self: { DNSName: dns } });
const ok = (stdout = ""): ReturnType<Ejecutar> => ({ ok: true, stdout });
const fallo: ReturnType<Ejecutar> = { ok: false, stdout: "" };

describe("resolverBase", () => {
  test("PREVIEW_BASE_URL gana y no llama a tailscale", () => {
    let llamadas = 0;
    const base = resolverBase({ PREVIEW_BASE_URL: "https://x.ts.net/" }, () => (llamadas++, fallo));
    assert.equal(base, "https://x.ts.net");
    assert.equal(llamadas, 0);
  });
  test("sin env usa Self.DNSName sin el punto final", () => {
    const base = resolverBase({}, () => ok(estado("mac-mini.goby-arcturus.ts.net.")));
    assert.equal(base, "https://mac-mini.goby-arcturus.ts.net");
  });
  test("null si tailscale falla, no está o devuelve basura", () => {
    assert.equal(resolverBase({}, () => fallo), null);
    assert.equal(resolverBase({}, () => ok("no es json")), null);
    assert.equal(resolverBase({}, () => ok(estado(""))), null);
  });
});

describe("urlPreview", () => {
  test("formato <base>:<puerto>/<equipo>", () => {
    assert.equal(urlPreview("https://h.ts.net", 3123, "sello-b"), "https://h.ts.net:3123/sello-b");
  });
});

describe("publicar y retirar", () => {
  test("publicar ejecuta serve --bg con su puerto", () => {
    const args: string[][] = [];
    assert.equal(publicar(3123, (a) => (args.push(a), ok())), true);
    assert.deepEqual(args, [["serve", "--bg", "--https=3123", "http://127.0.0.1:3123"]]);
  });
  test("rechaza el 443 sin ejecutar nada", () => {
    let llamadas = 0;
    const run: Ejecutar = () => (llamadas++, ok());
    assert.equal(publicar(443, run), false);
    assert.equal(retirar(443, run), false);
    assert.equal(llamadas, 0);
  });
  test("retirar corre una sola vez y solo con su puerto", () => {
    const args: string[][] = [];
    const run: Ejecutar = (a) => (args.push(a), ok());
    publicar(3123, run);
    args.length = 0;
    retirar(3123, run);
    retirar(3123, run);
    assert.deepEqual(args, [["serve", "--https=3123", "off"]]);
  });
  test("retirar sin publicar antes no hace nada", () => {
    let llamadas = 0;
    assert.equal(retirar(3999, () => (llamadas++, ok())), false);
    assert.equal(llamadas, 0);
  });
});
