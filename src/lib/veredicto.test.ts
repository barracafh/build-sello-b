import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NOMBRES_EJEMPLOS } from "@/datos/ejemplos";
import ejemplos from "../../datos/mensajes-ejemplo.json";
import { VEREDICTOS, deEntidad, fichaDe, leerRespuesta, mesDe, miles, webOficial } from "./veredicto";

describe("fichaDe", () => {
  test("un veredicto desconocido es la duda, nunca «oficial»", () => {
    assert.equal(fichaDe("raro"), VEREDICTOS.no_determinable);
    assert.equal(fichaDe("toString"), VEREDICTOS.no_determinable);
  });

  test("ninguna etiqueta enseña el código crudo", () => {
    for (const ficha of Object.values(VEREDICTOS)) {
      assert.doesNotMatch(ficha.etiqueta, /_/);
    }
  });
});

describe("titulares", () => {
  test("nombran la entidad si la hay", () => {
    const titular = VEREDICTOS.no_oficial.titular({ deEntidad: deEntidad("DGT"), hayEnlace: true });
    assert.equal(titular, "Este enlace no es de la DGT");
  });

  test("sin entidad, titular genérico", () => {
    assert.equal(
      VEREDICTOS.no_oficial.titular({ deEntidad: null, hayEnlace: false }),
      "Este mensaje no es oficial",
    );
    assert.equal(
      VEREDICTOS.no_determinable.titular({ deEntidad: null, hayEnlace: true }),
      "No podemos saber quién lo envía",
    );
  });
});

describe("deEntidad", () => {
  test("pone el artículo cuando lo sabe", () => {
    assert.equal(deEntidad("Seguridad Social"), "de la Seguridad Social");
    assert.equal(deEntidad("SEPE"), "del SEPE");
    assert.equal(deEntidad("Correos"), "de Correos");
    assert.equal(deEntidad("el Ayuntamiento"), "del Ayuntamiento");
  });

  test("vacío o ausente es null", () => {
    assert.equal(deEntidad(undefined), null);
    assert.equal(deEntidad("  "), null);
  });
});

describe("webOficial", () => {
  test("da la dirección corta", () => {
    assert.deepEqual(webOficial("https://sede.dgt.gob.es"), {
      href: "https://sede.dgt.gob.es/",
      direccion: "sede.dgt.gob.es",
    });
  });

  test("solo enlaza webs https de la lista", () => {
    assert.equal(webOficial("javascript:alert(1)"), null);
    assert.equal(webOficial("hxxps://dgt[.]es"), null);
    assert.equal(webOficial("http://sede.dgt.gob.es"), null);
    assert.equal(webOficial("https://dgt-multas-pago.com/expediente"), null);
    assert.equal(webOficial("https://sede.dgt.gob.es@dgt-multas-pago.com"), null);
    assert.equal(webOficial(null), null);
  });

  test("acepta la web oficial correcta de cada ejemplo", () => {
    for (const caso of ejemplos) assert.ok(webOficial(caso.web_oficial_correcta), caso.id);
  });
});

describe("leerRespuesta", () => {
  test("sin veredicto no hay respuesta", () => {
    assert.equal(leerRespuesta(null), null);
    assert.equal(leerRespuesta({ error: "JSON no válido" }), null);
    assert.equal(leerRespuesta({ veredicto: 3 }), null);
  });

  test("tolera campos ausentes o de otro tipo", () => {
    assert.deepEqual(
      leerRespuesta({
        veredicto: "no_oficial",
        motivos: ["x", 2],
        entidad: 1,
        senales: [{ codigo: "a", nivel: "roja", texto: "t" }, { codigo: "b", nivel: "azul", texto: "t" }],
        indicador: { nombre: "INCIBE" },
      }),
      {
        veredicto: "no_oficial",
        motivos: ["x"],
        url_analizada: null,
        remitente_analizado: null,
        entidad: null,
        web_oficial: null,
        fuente: null,
        indicador: null,
        aviso: null,
        senales: [{ codigo: "a", nivel: "roja", texto: "t" }],
        reputacion: null,
        rdap: null,
        desmentidos: [],
      },
    );
  });

  test("solo deja desmentidos completos con enlace https", () => {
    const bueno = {
      editor: "Maldita.es",
      sitio: "maldita.es",
      calificacion: "Falso",
      url: "https://maldita.es/x",
      fecha: "2025-03-01T00:00:00Z",
    };
    const respuesta = leerRespuesta({
      veredicto: "no_oficial",
      desmentidos: [
        bueno,
        { ...bueno, url: "javascript:alert(1)" },
        { ...bueno, url: "http://maldita.es/y" },
        { ...bueno, editor: 3 },
        { editor: "Newtral", calificacion: "Bulo", url: "https://newtral.es/z" },
      ],
    });
    assert.deepEqual(respuesta?.desmentidos, [
      bueno,
      { editor: "Newtral", sitio: null, calificacion: "Bulo", url: "https://newtral.es/z", fecha: null },
    ]);
    assert.deepEqual(leerRespuesta({ veredicto: "no_oficial", desmentidos: "no_consultado" })?.desmentidos, []);
  });

  test("neutraliza la URL analizada aunque llegue viva", () => {
    const respuesta = leerRespuesta({ veredicto: "no_oficial", url_analizada: "https://dgt-multas.com/x" });
    assert.equal(respuesta?.url_analizada, "hxxps://dgt-multas[.]com/x");
  });
});

test("cada ejemplo tiene un nombre propio y no se repiten", () => {
  const nombres = ejemplos.map((caso) => NOMBRES_EJEMPLOS[caso.id]);
  for (const [i, nombre] of nombres.entries()) assert.ok(nombre, ejemplos[i].id);
  assert.equal(new Set(nombres).size, ejemplos.length);
});

test("mesDe", () => {
  assert.equal(mesDe("2025-03-01T00:00:00Z"), "marzo de 2025");
  assert.equal(mesDe("no es fecha"), null);
  assert.equal(mesDe(null), null);
});

test("miles", () => {
  assert.equal(miles(2000), "2.000");
  assert.equal(miles(950), "950");
});
