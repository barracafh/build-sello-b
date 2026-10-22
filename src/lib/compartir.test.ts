import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { combinar, senales } from "./senales";
import { verificar } from "./verificar";
import { leerRespuesta } from "./veredicto";
import { enlaceWhatsApp, resumenParaFamilia, textoParaFamilia } from "./compartir";
import ejemplos from "../../datos/mensajes-ejemplo.json";
import ficha from "../../ficha.json";

// Correos de mentira, compuestos por partes para que el detector de buildnight
// no los tome por reales (mismo recurso que factcheck.test.ts).
const junto = (...p: string[]) => p.join("");

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};

const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

// Lo mismo que /api/verificar, sin los desmentidos (que van a la red).
const resultadoDe = (texto: string) => {
  const url = verificar(texto);
  const respuesta = leerRespuesta(combinar(url, senales(texto, url), texto));
  assert.ok(respuesta);
  return respuesta;
};

// Solo pueden ir vivas la web de la herramienta y webs oficiales sin esquema.
const enlacesVivos = (texto: string) =>
  [...texto.matchAll(/https?:\/\/\S+/g)].map((m) => m[0]).filter((u) => !u.startsWith(`${ficha.url}?lang=`));

describe("resumen para la familia de cada ejemplo", () => {
  for (const caso of ejemplos as Ejemplo[]) {
    const texto = textoDeEjemplo(caso);
    const respuesta = resultadoDe(texto);
    const resumen = resumenParaFamilia(respuesta);

    test(`${caso.id}: no lleva el texto del mensaje`, () => {
      // Ningún trozo de 30 caracteres seguidos del mensaje original, salvo el
      // nombre de la entidad (L04: «Dirección Electrónica Habilitada»).
      for (let i = 0; i + 30 <= caso.texto.length; i += 10) {
        const trozo = caso.texto.slice(i, i + 30);
        if (respuesta.entidad?.includes(trozo)) continue;
        assert.ok(!resumen.includes(trozo), trozo);
      }
    });

    test(`${caso.id}: ninguna dirección analizada va viva`, () => {
      assert.deepEqual(enlacesVivos(resumen), []);
    });

    test(`${caso.id}: dice el veredicto y lleva el aviso de herramienta no oficial`, () => {
      const frase = {
        no_oficial: "NO es oficial",
        no_determinable: "no se puede",
        oficial_verificado: "está en la lista de webs oficiales",
      }[caso.esperado];
      assert.ok(frase && resumen.includes(frase), resumen);
      assert.ok(resumen.includes("Herramienta experimental. No es un servicio oficial."));
    });
  }
});

describe("texto para la familia sin el mensaje pegado", () => {
  // Marca inventada: si aparece en lo que se comparte, se ha colado el mensaje.
  const CANARIO = "CANARIO-LAB82";
  const casos = {
    no_oficial: "F01",
    no_determinable: "L01",
    oficial_verificado: "L05",
  };

  for (const [veredicto, id] of Object.entries(casos)) {
    const caso = (ejemplos as Ejemplo[]).find((e) => e.id === id && e.esperado === veredicto);

    test(`${veredicto}: no lleva el mensaje, sí el 017 y el aviso`, () => {
      assert.ok(caso, id);
      const mensaje = `${CANARIO} ${textoDeEjemplo(caso)}`;
      const respuesta = resultadoDe(mensaje);
      assert.equal(respuesta.veredicto, veredicto);
      const texto = textoParaFamilia(respuesta);
      assert.ok(!texto.includes(CANARIO), texto);
      assert.ok(!decodeURIComponent(enlaceWhatsApp(texto)).includes(CANARIO));
      assert.ok(!texto.includes("Me ha llegado"));
      assert.ok(texto.includes("017"), texto);
      assert.ok(texto.includes("Herramienta experimental. No es un servicio oficial."), texto);
      assert.deepEqual(enlacesVivos(texto), []);
    });
  }
});

test("un veredicto desconocido se comparte como duda", () => {
  const resumen = resumenParaFamilia({
    veredicto: "raro",
    motivos: [],
    url_analizada: null,
    remitente_analizado: null,
    entidad: null,
    web_oficial: null,
  });
  assert.match(resumen, /no se puede saber quién lo envía/);
  assert.doesNotMatch(resumen, /es oficial|lista de webs oficiales/);
});

test("neutraliza la dirección aunque llegue viva y no enlaza webs fuera de la lista", () => {
  const resumen = resumenParaFamilia({
    veredicto: "no_oficial",
    motivos: [],
    url_analizada: "https://dgt-multas-pago.com/x",
    remitente_analizado: null,
    entidad: "DGT",
    web_oficial: "https://dgt-multas-pago.com",
  });
  assert.match(resumen, /hxxps:\/\/dgt-multas-pago\[\.\]com\/x/);
  assert.doesNotMatch(resumen, /La web oficial/);
});

test("sin enlace, habla del remitente neutralizado", () => {
  const resumen = resumenParaFamilia({
    veredicto: "no_oficial",
    motivos: [],
    url_analizada: null,
    remitente_analizado: junto("dgt", "@", "multas.com"),
    entidad: "DGT",
    web_oficial: "https://sede.dgt.gob.es",
  });
  assert.match(resumen, /dgt@multas\[\.\]com/);
  assert.match(resumen, /La web oficial de la DGT es sede\.dgt\.gob\.es/);
});

test("si el mensaje cita la web oficial, no dice que no se pulse", () => {
  const resumen = resumenParaFamilia({
    veredicto: "no_determinable",
    motivos: ["web_oficial_citada"],
    url_analizada: "sede[.]dgt[.]gob[.]es",
    remitente_analizado: null,
    entidad: "DGT",
    web_oficial: "https://sede.dgt.gob.es",
  });
  assert.match(resumen, /cita la web oficial, pero eso no prueba quién lo envía/);
  assert.doesNotMatch(resumen, /no pulses/);
});

test("enlaceWhatsApp codifica el texto", () => {
  assert.equal(enlaceWhatsApp("a b\n&c"), "https://wa.me/?text=a%20b%0A%26c");
});

describe("resumen en otro idioma", () => {
  const respuesta = {
    veredicto: "no_oficial",
    motivos: [],
    url_analizada: "hxxps://dgt-multas[.]com",
    remitente_analizado: null,
    entidad: "DGT",
    web_oficial: "https://sede.dgt.gob.es/",
  };

  test("el enlace a la herramienta lleva ?lang", () => {
    assert.ok(resumenParaFamilia(respuesta, "eu").includes(`${ficha.url}?lang=eu`));
    assert.ok(resumenParaFamilia(respuesta).includes(`${ficha.url}?lang=es`));
  });

  test("usa los textos del idioma y conserva el 017, la entidad y la dirección", () => {
    const texto = textoParaFamilia(respuesta, "ca");
    assert.ok(!texto.includes("Me ha llegado"));
    for (const fijo of ["017", "DGT", "hxxps://dgt-multas[.]com", "sede.dgt.gob.es", "No és un servei oficial."]) {
      assert.ok(texto.includes(fijo), fijo);
    }
  });
});
