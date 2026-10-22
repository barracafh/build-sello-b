import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { fragmentosDelModelo, fragmentosDeterministas, fusionar } from "./fragmentos";
import { combinar, senales } from "./senales";
import { verificar } from "./verificar";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Caso = (typeof ejemplos)[number] & { url_defanged?: string | null; url?: string };
const textoDe = (caso: Caso) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

const deterministas = (texto: string) => {
  const url = verificar(texto);
  return fusionar(texto, fragmentosDeterministas(texto, senales(texto, url), url));
};

const dentro = (texto: string, fs: { inicio: number; fin: number }[]) =>
  fs.every((f) => 0 <= f.inicio && f.inicio < f.fin && f.fin <= texto.length);

describe("fragmentosDeterministas", () => {
  for (const caso of ejemplos as Caso[]) {
    const texto = textoDe(caso);
    if (caso.esperado === "no_oficial") {
      test(`${caso.id}: al menos una trampa roja, con una frase real`, () => {
        const fs = deterministas(texto);
        assert.ok(fs.some((f) => f.nivel === "roja"), JSON.stringify(fs));
        assert.ok(dentro(texto, fs));
        for (const f of fs) assert.match(texto.slice(f.inicio, f.fin), /[\p{L}\d]/u);
      });
    }
    test(`${caso.id}: el veredicto no cambia`, () => {
      const url = verificar(texto);
      assert.equal(combinar(url, senales(texto, url), texto).veredicto, caso.esperado);
    });
  }

  test("L05 no tiene ninguna trampa roja", () => {
    const l05 = (ejemplos as Caso[]).find((c) => c.id === "L05")!;
    assert.ok(!deterministas(textoDe(l05)).some((f) => f.nivel === "roja"));
  });

  test("subraya la petición de pago y el plazo de F02", () => {
    const texto = "DGT: Dispone de 24 horas restantes para pagar su multa. hxxps://dgt-multas-pago[.]com/x";
    const fs = deterministas(texto);
    const trozos = fs.map((f) => [texto.slice(f.inicio, f.fin), f.nivel]);
    assert.deepEqual(trozos, [
      ["24 horas", "naranja"],
      ["para pagar", "roja"],
      ["hxxps://dgt-multas-pago[.]com/x", "roja"],
    ]);
  });

  test("una frase negada no se subraya", () => {
    const texto =
      "AEAT: nunca le pediremos su número de tarjeta. Facilite su número de tarjeta aquí.";
    const fs = deterministas(texto);
    const datos = fs.filter((f) => f.codigo === "pide_datos");
    assert.equal(datos.length, 1);
    assert.ok(datos[0].inicio > texto.indexOf("Facilite") - 1);
  });

  test("«Cl@ve PIN» no se subraya como petición de datos", () => {
    const texto = "Acceda con Cl@ve PIN a la sede. Debe pagar 50 € hoy.";
    const fs = deterministas(texto);
    assert.ok(!fs.some((f) => texto.slice(f.inicio, f.fin).includes("PIN")));
  });

  test("subraya un teléfono que no es oficial, no el 060", () => {
    // Inventado y por partes, para que no parezca un dato personal.
    const numero = ["911", "234", "567"].join(" ");
    const texto = `SEPE: llame al ${numero} para su prestación. O al ${["0", "60"].join("")}.`;
    const fs = deterministas(texto);
    assert.deepEqual(fs.map((f) => texto.slice(f.inicio, f.fin)), [numero]);
  });

  test("subraya el remitente falso", () => {
    const correo = ["avisos", "hacienda-reembolso.top"].join("@");
    const texto = `De: Agencia Tributaria <${correo}>. Su devolución está lista.`;
    const fs = deterministas(texto);
    assert.ok(
      fs.some((f) => f.nivel === "roja" && texto.slice(f.inicio, f.fin).includes("hacienda-reembolso.top")),
      JSON.stringify(fs),
    );
  });
});

describe("fragmentosDelModelo", () => {
  const texto = "Su paquete no se ha podido entregar.  Pague las TASAS de aduana ya.";

  test("encuentra la cita sin mirar mayúsculas ni espacios", () => {
    const [f] = fragmentosDelModelo(texto, [{ codigo: "pide_dinero", fragmento: "pague las tasas de aduana" }]);
    assert.equal(texto.slice(f.inicio, f.fin), "Pague las TASAS de aduana");
    assert.equal(f.nivel, "roja");
  });

  test("la cita que no está en el mensaje se descarta", () => {
    assert.deepEqual(
      fragmentosDelModelo(texto, [{ codigo: "pide_datos", fragmento: "introduzca su CVV" }]),
      [],
    );
  });

  test("el color sale del código, no del modelo; sin código conocido no hay rango", () => {
    const fs = fragmentosDelModelo(texto, [
      { codigo: "urgencia", fragmento: "ya" },
      { codigo: "aviso_informativo", fragmento: "Su paquete" },
      { codigo: "sin_senales", fragmento: "Su paquete" },
      { codigo: "inventado", fragmento: "Su paquete" },
      { codigo: "amenaza", fragmento: null },
      { codigo: "amenaza" },
    ]);
    assert.deepEqual(fs.map((f) => [f.codigo, f.nivel]), [["urgencia", "naranja"]]);
  });
});

describe("fusionar", () => {
  test("los solapes se funden y gana la roja", () => {
    const texto = "abcdefghijklmnopqrstuvwxyz";
    const fs = fusionar(texto, [
      { inicio: 0, fin: 10, nivel: "naranja", codigo: "urgencia" },
      { inicio: 5, fin: 15, nivel: "roja", codigo: "pide_dinero" },
      { inicio: 14, fin: 20, nivel: "roja", codigo: "amenaza" },
    ]);
    assert.deepEqual(fs, [
      { inicio: 0, fin: 5, nivel: "naranja", codigo: "urgencia" },
      { inicio: 5, fin: 20, nivel: "roja", codigo: "pide_dinero" },
    ]);
  });

  test("todo rango queda dentro de [0, texto.length]", () => {
    const texto = "corto";
    const fs = fusionar(texto, [
      { inicio: -4, fin: 3, nivel: "roja", codigo: "amenaza" },
      { inicio: 3, fin: 99, nivel: "naranja", codigo: "urgencia" },
      { inicio: 8, fin: 9, nivel: "roja", codigo: "amenaza" },
    ]);
    assert.ok(dentro(texto, fs));
    assert.deepEqual(fs.map((f) => [f.inicio, f.fin]), [[0, 3], [3, 5]]);
  });

  test("un rango que toca una URL la cubre entera", () => {
    const texto = "Pague aquí https://dgt-multas.top/pago ya";
    const inicio = texto.indexOf("aquí");
    const [f] = fusionar(texto, [
      { inicio, fin: texto.indexOf("multas"), nivel: "roja", codigo: "pide_dinero" },
    ]);
    assert.equal(texto.slice(f.inicio, f.fin), "aquí https://dgt-multas.top/pago");
  });
});
