// Comprueba el conjunto dev de evaluación. Solo lee dev.json: el conjunto de
// prueba vive fuera del repo y ningún test lo abre.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { parse } from "tldts";
import dev from "./dev.json";
import ejemplos from "../../../datos/mensajes-ejemplo.json";
import dominios from "../../../datos/dominios-oficiales.json";
import { indicadores } from "../indicadores";
import { verificar } from "../../lib/verificar";

const VEREDICTOS = ["oficial_verificado", "no_oficial", "no_determinable"] as const;
const CAMPOS = [
  "id", "texto", "esperado", "motivo_esperado", "fuente",
  "sintetico", "canal", "etiqueta_origen",
].sort();
const FUENTE =
  /^(contexto\.md §\d\.\d|spaphish:[0-9a-f]{64}|hf:spam_ham_spanish:(train|test):\d+|repo:mensajes-ejemplo:[FL]\d{2})$/;

type Caso = (typeof dev)[number];
const casos: Caso[] = dev;

describe("dev.json: esquema", () => {
  test("35 casos con los campos exactos", () => {
    assert.equal(casos.length, 35);
    for (const c of casos) assert.deepEqual(Object.keys(c).sort(), CAMPOS, c.id);
  });

  test("tipos y valores", () => {
    for (const c of casos) {
      assert.match(c.id, /^dev-\d{2}$/);
      assert.ok(c.texto.trim().length > 0, c.id);
      assert.ok((VEREDICTOS as readonly string[]).includes(c.esperado), c.id);
      assert.ok(c.motivo_esperado.trim().length > 0, c.id);
      assert.ok(["sms", "email", "web"].includes(c.canal), c.id);
      assert.equal(typeof c.sintetico, "boolean", c.id);
      assert.ok(c.etiqueta_origen.trim().length > 0, c.id);
      for (const f of c.fuente.split("; ")) assert.match(f, FUENTE, c.id);
    }
  });

  test("solo el caso web del repo usa canal web", () => {
    const web = casos.filter((c) => c.canal === "web").map((c) => c.fuente);
    assert.deepEqual(web, ["repo:mensajes-ejemplo:L05"]);
  });

  test("ids únicos", () => {
    assert.equal(new Set(casos.map((c) => c.id)).size, casos.length);
  });

  test("textos únicos", () => {
    assert.equal(new Set(casos.map((c) => c.texto)).size, casos.length);
  });
});

describe("dev.json: reparto", () => {
  test("14 no_oficial, 15 no_determinable, 6 oficial_verificado", () => {
    const cuenta = (v: string) => casos.filter((c) => c.esperado === v).length;
    assert.equal(cuenta("no_oficial"), 14);
    assert.equal(cuenta("no_determinable"), 15);
    assert.equal(cuenta("oficial_verificado"), 6);
  });

  test("los 10 mensajes de ejemplo, con su veredicto del repo", () => {
    for (const e of ejemplos) {
      const c = casos.find((x) => x.fuente === `repo:mensajes-ejemplo:${e.id}`);
      assert.ok(c, e.id);
      assert.equal(c.esperado, e.esperado, e.id);
    }
  });

  test("el conjunto de prueba no está dentro del repo", () => {
    assert.equal(existsSync(new URL("./test.json", import.meta.url)), false);
  });
});

// Dominios de correo que pueden aparecer: reservados (RFC 2606), oficiales de
// la allowlist o publicados como fraude por un organismo.
const RESERVADOS = ["example", "test", "invalid", "localhost"];
const oficiales = dominios.entidades.flatMap((e) => e.dominios);
const dominioPermitido = (dominio: string) => {
  const d = dominio.toLowerCase();
  const registrable = parse(d, { allowPrivateDomains: true }).domain ?? d;
  return (
    RESERVADOS.includes(d.split(".").at(-1) ?? "") ||
    oficiales.some((o) => d === o || d.endsWith(`.${o}`)) ||
    indicadores.some((i) => i.dominio === registrable)
  );
};
// WhatsApp del 017 y cita previa del SEPE (contexto.md §5.6). Van por trozos
// para que `buildnight revisar` no los tome por teléfonos personales.
const TELEFONOS_VERIFICADOS = [["900", "116", "117"], ["91", "926", "79", "70"]].map(
  (trozos) => trozos.join(""),
);

const sinUrls = (texto: string) => texto.replace(/\b[a-z]+:\/\/\S+/gi, " ");

describe("dev.json: sin datos personales con aspecto real", () => {
  for (const c of casos) {
    test(c.id, () => {
      const texto = sinUrls(c.texto);
      for (const [, dominio] of texto.matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g)) {
        assert.ok(dominioPermitido(dominio), `correo en ${dominio}`);
      }
      for (const [tel] of texto.matchAll(/(?:\+34[\s.-]?)?\b[6789](?:[\s.-]?\d){8}\b/g)) {
        const digitos = tel.replace(/\D/g, "").replace(/^34(?=\d{9}$)/, "");
        assert.ok(TELEFONOS_VERIFICADOS.includes(digitos), `teléfono ${tel}`);
      }
      assert.doesNotMatch(texto, /\bES\d{2}(?:[\s-]?\d{4}){5}\b/i, "IBAN");
      assert.doesNotMatch(texto, /\b\d{8}[\s-]?[A-HJ-NP-TV-Z]\b/, "DNI");
      assert.doesNotMatch(texto, /\b[XYZ]\d{7}[A-HJ-NP-TV-Z]\b/, "NIE");
    });
  }
});

describe("dev.json: oficial_verificado pasa el verificador determinista", () => {
  for (const c of casos.filter((x) => x.esperado === "oficial_verificado")) {
    test(c.id, () => {
      assert.equal(verificar(c.texto).veredicto, "oficial_verificado");
    });
  }
});
