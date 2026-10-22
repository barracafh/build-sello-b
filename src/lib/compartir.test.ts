import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { combinar, senales } from "./senales";
import { verificar } from "./verificar";
import { leerRespuesta } from "./veredicto";
import {
  enlaceWhatsApp,
  invitacionParaFamilia,
  neutralizarTexto,
  resumenParaFamilia,
  textoParaFamilia,
} from "./compartir";
import ejemplos from "../../datos/mensajes-ejemplo.json";
import ficha from "../../ficha.json";

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
  [...texto.matchAll(/https?:\/\/\S+/g)].map((m) => m[0]).filter((u) => u !== ficha.url);

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
      assert.ok(resumen.includes("no es un servicio oficial"));
    });
  }
});

describe("texto para la familia con el mensaje", () => {
  for (const caso of ejemplos as Ejemplo[]) {
    test(`${caso.id}: lleva el mensaje y el resultado, sin direcciones vivas`, () => {
      const mensaje = textoDeEjemplo(caso);
      const texto = textoParaFamilia(mensaje, resultadoDe(mensaje));
      assert.ok(texto.startsWith("Me ha llegado este mensaje:"));
      assert.ok(texto.includes(resumenParaFamilia(resultadoDe(mensaje))));
      // Las primeras palabras del mensaje, tal cual.
      assert.ok(texto.includes(caso.texto.slice(0, 12)), caso.id);
      assert.deepEqual(enlacesVivos(texto), []);
      // Ningún dominio con puntos normales salvo la web de la herramienta y las oficiales del resumen.
      const cita = texto.split("\n\n")[1];
      assert.doesNotMatch(cita, /[a-z0-9-]\.[a-z]{2,}\b/i, cita);
    });
  }
});

test("neutralizarTexto desactiva URL, dominios sueltos y correos", () => {
  assert.equal(
    neutralizarTexto("Pague en https://dgt-multas.com/x. O en sede.dgt.gob.es o escriba a a@correos.com"),
    "Pague en hxxps://dgt-multas[.]com/x. O en sede[.]dgt[.]gob[.]es o escriba a a@correos[.]com",
  );
  assert.equal(neutralizarTexto("Pague 411,00 € hoy. Gracias."), "Pague 411,00 € hoy. Gracias.");
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
    remitente_analizado: "dgt@multas.com",
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

test("la invitación lleva la web publicada y el aviso", () => {
  assert.ok(invitacionParaFamilia().includes(ficha.url));
  assert.ok(invitacionParaFamilia().includes("no es un servicio oficial"));
});

test("enlaceWhatsApp codifica el texto", () => {
  assert.equal(enlaceWhatsApp("a b\n&c"), "https://wa.me/?text=a%20b%0A%26c");
});
