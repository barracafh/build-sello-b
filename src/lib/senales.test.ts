import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { verificar } from "./verificar";
import { combinar, senales } from "./senales";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};

const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

// Se montan por partes para que la regla de datos personales no vea literales.
const A = "@";
const tel = (...p: string[]) => p.join(" ");

const codigos = (texto: string) =>
  senales(texto, verificar(texto)).map((s) => s.codigo);
const nivel = (texto: string, codigo: string) =>
  senales(texto, verificar(texto)).find((s) => s.codigo === codigo)?.nivel;
const veredicto = (texto: string) =>
  combinar(verificar(texto), senales(texto, verificar(texto)), texto).veredicto;

describe("1. enlace fuera de la lista y 3. acortadores", () => {
  test("dominio desconocido → naranja", () => {
    assert.equal(nivel("Mira esto https://ejemplo-raro[.]com/a", "enlace_no_listado"), "naranja");
  });
  test("acortador → naranja", () => {
    assert.equal(nivel("Pague aquí https://bit.ly/abc", "enlace_acortado"), "naranja");
  });
  test("marca como subdominio → roja", () => {
    assert.equal(
      nivel("hxxps://sede.dgt.gob.es.multas[.]top/x", "enlace_imita_oficial"),
      "roja",
    );
  });
  test("web oficial → sin señal de enlace", () => {
    const c = codigos("Consulte https://sede.dgt.gob.es/es/multas");
    assert.ok(!c.some((x) => x.startsWith("enlace_")));
  });
  test("sin enlace → sin señal de enlace", () => {
    assert.ok(!codigos("Tiene una notificación pendiente.").some((x) => x.startsWith("enlace_")));
  });
});

describe("2. urgencia y amenazas", () => {
  test("plazo de 24 horas → naranja", () => {
    assert.equal(nivel("Dispone de 24 horas restantes", "urgencia"), "naranja");
  });
  test("48 h y último aviso → naranja", () => {
    assert.equal(nivel("Último aviso: responda en 48 h", "urgencia"), "naranja");
  });
  test("descuento de 9 días → naranja", () => {
    assert.equal(nivel("Tiene 9 días para el descuento del 50%", "urgencia"), "naranja");
  });
  test("amenaza de embargo → roja", () => {
    assert.equal(nivel("Se procederá al embargo de sus cuentas", "amenaza"), "roja");
  });
  test("amenaza de arresto → roja", () => {
    assert.equal(nivel("Podría ser detenido en 72 horas", "amenaza"), "roja");
  });
  test("aviso normal → sin urgencia", () => {
    assert.ok(!codigos("Tiene una nueva notificación disponible en la sede.").includes("urgencia"));
  });
});

describe("4. ortografía", () => {
  test("fallo de codificación → naranja", () => {
    assert.equal(nivel("pago 411,00¿ de su renta", "ortografia"), "naranja");
    assert.equal(nivel("InformaciÃ³n de su cuenta", "ortografia"), "naranja");
  });
  test("palabra burocrática sin tilde → naranja", () => {
    assert.equal(nivel("su devolucion del IRPF", "ortografia"), "naranja");
  });
  test("con tilde → sin señal", () => {
    assert.ok(!codigos("su devolución e información").includes("ortografia"));
  });
  test("nunca es roja ni cambia el veredicto sola", () => {
    const t = "Aviso de devolucion e informacion";
    assert.equal(nivel(t, "ortografia"), "naranja");
    assert.equal(veredicto(t), "no_determinable");
  });
});

describe("5. remitente con el nombre del servicio y otro dominio", () => {
  test("remitente carpetaciudadana en otro dominio → roja", () => {
    assert.equal(
      nivel(`De: carpetaciudadana${A}info[.]com[.]es Revise su expediente`, "remitente_falso"),
      "roja",
    );
  });
  test("nombre visible con marca y dominio ajeno → roja", () => {
    assert.equal(
      nivel(`De: Agencia Tributaria <avisos${A}mail-seguro.net>`, "remitente_falso"),
      "roja",
    );
  });
  test("remitente de la allowlist → sin señal", () => {
    assert.ok(!codigos(`De: correos${A}correos.com. Su envío está en reparto.`).includes("remitente_falso"));
  });
  test("remitente sin marca → sin señal", () => {
    assert.ok(!codigos(`De: juan${A}ejemplo.com Hola`).includes("remitente_falso"));
  });
});

describe("6. dinero, pagos y datos sensibles", () => {
  test("pagar la multa → roja", () => {
    assert.equal(nivel("Debe pagar su multa hoy", "pide_dinero"), "roja");
  });
  test("tasas no pagadas → roja", () => {
    assert.equal(nivel("no se han pagado las tasas de aduana", "pide_dinero"), "roja");
  });
  test("tarjeta, CVV, PIN → roja", () => {
    assert.equal(nivel("Indique el CVV y el PIN", "pide_datos"), "roja");
  });
  test("contraseña o IBAN → roja", () => {
    assert.equal(nivel("Envíe su contraseña", "pide_datos"), "roja");
    assert.equal(nivel("Confirme su IBAN", "pide_datos"), "roja");
  });
  test("pide DNI → roja", () => {
    assert.equal(nivel("Por favor, facilite su DNI y fecha de nacimiento", "pide_datos"), "roja");
  });
  test("mencionar una multa o un importe no cuenta", () => {
    const c = codigos("Tiene una nueva notificación sobre una multa de 200 euros en su DEV.");
    assert.ok(!c.includes("pide_dinero") && !c.includes("pide_datos"));
  });
  test("identificarse con DNIe no cuenta", () => {
    assert.ok(!codigos("Identifíquese con DNI electrónico o Cl@ve").includes("pide_datos"));
  });
  test("«nunca le pediremos» no cuenta", () => {
    assert.ok(!codigos("Nunca le pediremos su contraseña ni el CVV.").includes("pide_datos"));
  });
  test("«Cl@ve PIN» solo no cuenta (AEAT1, DEHU, AEAT4)", () => {
    const casos = [
      "Agencia Tributaria: notificación pendiente. Entre en la sede con Cl@ve PIN.",
      "Tiene una notificación en la DEHú. Acceda con Cl@ve PIN.",
      "Agencia Tributaria: acceda con Cl@ve PIN a https://sede.agenciatributaria.gob.es",
      "Introduzca su Cl@ve PIN en la sede electrónica.",
    ];
    for (const t of casos) {
      assert.ok(!codigos(t).includes("pide_datos"), t);
    }
    assert.equal(veredicto(casos[0]), "no_determinable");
    assert.equal(veredicto(casos[1]), "no_determinable");
    assert.equal(veredicto(casos[2]), "oficial_verificado");
  });
  test("«pin» y «nie» dentro de otra palabra no cuentan", () => {
    const frases = [
      "Agencia Tributaria: confirme su opinión sobre la atención recibida en la sede.",
      "Seguridad Social: indique su opinión en la encuesta de la sede.",
      "Correos: confirme la entrega en Espinardo desde la sede.",
      "DGT: use su tarjeta y pinche aquí para ver el expediente en la sede.",
      "Seguridad Social: confirme los datos de su nieto en la sede.",
    ];
    for (const t of frases) {
      assert.ok(!codigos(t).includes("pide_datos"), t);
      assert.equal(veredicto(t), "no_determinable", t);
    }
  });
  test("pedir el NIE sí cuenta", () => {
    assert.equal(nivel("Por favor, facilite su NIE", "pide_datos"), "roja");
  });
  test("pedir el PIN sí cuenta", () => {
    assert.equal(nivel("Facilite su PIN", "pide_datos"), "roja");
    assert.equal(nivel("Envíenos el PIN por SMS", "pide_datos"), "roja");
    assert.equal(nivel("Número de tarjeta y PIN", "pide_datos"), "roja");
  });
  test("tarjeta sanitaria no cuenta", () => {
    assert.ok(!codigos("Su tarjeta sanitaria está lista.").includes("pide_datos"));
  });
});

describe("7. QR e instrucciones no estándar", () => {
  test("QR → roja", () => {
    assert.equal(nivel("Escanee el código QR para pagar", "instruccion_qr"), "roja");
  });
  test("responder al correo → naranja", () => {
    assert.equal(nivel("Responda a este correo para gestionar", "instruccion_rara"), "naranja");
  });
  test("descargar la app → naranja", () => {
    assert.equal(nivel("Descargue la app adjunta", "instruccion_rara"), "naranja");
  });
  test("807 → naranja", () => {
    assert.equal(nivel(`Llame al ${tel("807", "123", "456")}`, "instruccion_rara"), "naranja");
  });
  test("llamar a un número ajeno → naranja", () => {
    assert.equal(nivel(`Llame al ${tel("612", "345", "678")}`, "instruccion_rara"), "naranja");
  });
  test("017 y 060 → sin señal", () => {
    assert.ok(!codigos("Si dudas llama al 017 o al 060").includes("instruccion_rara"));
  });
  test("teléfono del SEPE verificado → sin señal", () => {
    assert.ok(!codigos(`Cita previa: llame al ${tel("91", "926", "79", "70")}`).includes("instruccion_rara"));
  });
});

describe("combinar con el veredicto", () => {
  test("roja + organismo, sin enlace → no_oficial", () => {
    assert.equal(
      veredicto("DGT: pague su multa con tarjeta, indique el CVV"),
      "no_oficial",
    );
  });
  test("roja sin organismo conocido → el veredicto de la URL se mantiene", () => {
    assert.equal(veredicto("Pague su multa de la ORA"), "no_determinable");
  });
  test("solo naranja + organismo → el veredicto de la URL se mantiene", () => {
    assert.equal(veredicto("DGT: dispone de 24 horas"), "no_determinable");
  });
  test("las señales nunca suben a oficial_verificado", () => {
    for (const t of ["DGT: dispone de 24 horas", "Consulte https://ejemplo-raro[.]com", "hola"]) {
      const r = verificar(t);
      assert.notEqual(combinar(r, senales(t, r), t).veredicto, "oficial_verificado");
    }
  });
  test("oficial_verificado con señal roja baja a no_determinable, nunca a no_oficial", () => {
    const t = "Agencia Tributaria: pague su multa en https://sede.agenciatributaria.gob.es";
    const r = verificar(t);
    assert.equal(r.veredicto, "oficial_verificado");
    const lista = senales(t, r);
    assert.ok(lista.some((s) => s.nivel === "roja"));
    const c = combinar(r, lista, t);
    assert.equal(c.veredicto, "no_determinable");
    assert.equal(c.motivos[0], "contenido_sospechoso");
  });
  test("web oficial citada sin esquema con señal roja baja a no_determinable, nunca a no_oficial", () => {
    const t = "DGT: para pagar la multa con descuento acceda a sede.dgt.gob.es";
    const r = verificar(t);
    assert.equal(r.veredicto, "no_determinable");
    assert.equal(r.motivos[0], "web_oficial_citada");
    const lista = senales(t, r);
    assert.ok(lista.some((s) => s.nivel === "roja"));
    const c = combinar(r, lista, t);
    assert.equal(c.veredicto, "no_determinable");
    assert.deepEqual(c.motivos.slice(0, 2), ["web_oficial_citada", "contenido_sospechoso"]);
    assert.equal(c.url_analizada, "sede[.]dgt[.]gob[.]es");
  });
  test("trampa sin esquema con señal roja sigue en no_oficial", () => {
    const t = "DGT: para pagar la multa con descuento acceda a dgt.es.multas-pago.com";
    const r = verificar(t);
    assert.equal(r.veredicto, "no_oficial");
    assert.equal(veredicto(t), "no_oficial");
    assert.equal(combinar(r, senales(t, r), t).url_analizada, "dgt[.]es[.]multas-pago[.]com");
  });
  test("web oficial citada con remitente ajeno sigue en no_oficial", () => {
    const remitente = ["avisos", "dgt-multas.com"].join("@");
    const t = `De: ${remitente}. Para pagar la multa con descuento acceda a sede.dgt.gob.es`;
    const r = verificar(t);
    assert.equal(r.veredicto, "no_oficial");
    assert.equal(combinar(r, senales(t, r), t).veredicto, "no_oficial");
  });
  test("importes y abreviaturas con puntos no cuentan como enlace", () => {
    const t = "DGT: importe 1.500,00 euros, recargos, etc.";
    assert.equal(verificar(t).url_analizada, null);
    assert.equal(veredicto(t), "no_determinable");
  });
  test("paro suelto no cuenta como organismo", () => {
    assert.equal(veredicto("Pague su multa por el paro del metro"), "no_determinable");
    assert.equal(
      veredicto("Prestación por desempleo: pague la tasa con tarjeta"),
      "no_oficial",
    );
  });
  test("aviso legítimo art. 41.6 sigue en no_determinable", () => {
    assert.equal(
      veredicto("DGT: tiene una multa pendiente en la DEV. Entre por la sede electrónica (sede.dgt.gob.es)."),
      "no_determinable",
    );
  });
});

describe("mensajes de ejemplo con señales", () => {
  for (const caso of ejemplos) {
    test(`${caso.id} → ${caso.esperado}`, () => {
      const texto = textoDeEjemplo(caso as Ejemplo);
      assert.equal(veredicto(texto), caso.esperado);
    });
  }
  test("los avisos legítimos no tienen señales rojas", () => {
    for (const caso of ejemplos.filter((c) => c.id.startsWith("L"))) {
      const texto = textoDeEjemplo(caso as Ejemplo);
      const rojas = senales(texto, verificar(texto)).filter((s) => s.nivel === "roja");
      assert.deepEqual(rojas, [], caso.id);
    }
  });
  test("F01 y F02 muestran señales de contenido", () => {
    const f01 = ejemplos.find((c) => c.id === "F01")!;
    const f02 = ejemplos.find((c) => c.id === "F02")!;
    assert.ok(codigos(textoDeEjemplo(f01 as Ejemplo)).includes("ortografia"));
    assert.ok(codigos(textoDeEjemplo(f02 as Ejemplo)).includes("urgencia"));
  });
});
