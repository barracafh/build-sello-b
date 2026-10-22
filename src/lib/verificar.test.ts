import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { verificar } from "./verificar";
import ejemplos from "../../datos/mensajes-ejemplo.json";

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};

const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

describe("mensajes de ejemplo", () => {
  for (const caso of ejemplos) {
    test(`${caso.id} → ${caso.esperado}`, () => {
      assert.equal(
        verificar(textoDeEjemplo(caso as Ejemplo)).veredicto,
        caso.esperado,
      );
    });
  }
});

const esperar = (texto: string, veredicto: string, motivo?: string) =>
  test(`${texto} → ${veredicto}${motivo ? ` (${motivo})` : ""}`, () => {
    const r = verificar(texto);
    assert.equal(r.veredicto, veredicto);
    if (motivo) assert.ok(r.motivos.includes(motivo), r.motivos.join());
  });

describe("§5.3 sin red", () => {
  esperar("sede.agenciatributaria.gob.es", "oficial_verificado", "en_allowlist");
  esperar("www.dgt.es", "oficial_verificado");
  esperar("dehu.redsara.es", "oficial_verificado");
  esperar("http://www.agenciatributaria.es", "oficial_verificado", "sin_cifrado");
  esperar("www.dgt.gob.es", "no_determinable", "gob_es_no_listado");
  esperar("zzqx-nonexistent-test1.sedelectronica.es", "no_determinable", "inquilino_no_listado");
  esperar("qwerty-zz91.sede.gob.es", "no_determinable", "inquilino_no_listado");
  esperar("mi-pueblo-ejemplo.com", "no_determinable");
  esperar("bit.ly/x", "no_determinable", "acortador_no_resuelto");
  esperar(["dgt.es", "ejemplo.top"].join("@"), "no_oficial", "credenciales_en_url");
  esperar("agenciatributaria.gob.es.ejemplo.top", "no_oficial", "marca_como_subdominio");
  esperar("dgt.es.multas-pago.com", "no_oficial", "marca_como_subdominio");
  esperar("dgt.es.multas-pago[.]com", "no_oficial", "marca_como_subdominio");
  esperar("portal.seg-socioal.cfd", "no_oficial", "imitacion_de_marca");
  esperar("http://192.168.0.1", "no_oficial", "ip_como_host");
  esperar("http://0x7f.1/", "no_oficial", "ip_como_host");
  esperar("ugt.es", "no_determinable", "posible_imitacion_de_marca");
});

describe("otros", () => {
  test("sin enlace", () => {
    const r = verificar("Hola, ¿qué tal?");
    assert.equal(r.veredicto, "no_determinable");
    assert.deepEqual(r.motivos, ["sin_enlace"]);
    assert.equal(r.url_analizada, null);
  });
  test("hola.que tal no es una URL", () => {
    assert.equal(verificar("hola.que tal").motivos[0], "sin_enlace");
  });
  test("un correo no es una URL", () => {
    assert.equal(verificar(`escribe a ${["correos", "correos.com"].join("@")}`).motivos[0], "sin_enlace");
  });
  test("oficial devuelve la web buena y la URL neutralizada", () => {
    const r = verificar("https://www.san.gva.es/es/web/x");
    assert.equal(r.web_oficial, "https://www.san.gva.es/es/web/portal-del-paciente");
    assert.equal(r.url_analizada, "hxxps://www[.]san[.]gva[.]es/es/web/x");
  });
  test("marca con palabra de contenido y .com → no_oficial", () => {
    assert.equal(verificar("Pague su multa en dgt-pagos.com").veredicto, "no_oficial");
  });
  test("un dominio oficial citado en prosa, sin esquema, no confirma el mensaje", () => {
    assert.equal(verificar("Consulta sede.dgt.gob.es").veredicto, "no_determinable");
  });
  test("sede.dival.es exacto es oficial, un inquilino no", () => {
    assert.equal(verificar("https://sede.dival.es").veredicto, "oficial_verificado");
    assert.equal(verificar("https://rocafort.sede.dival.es").veredicto, "no_determinable");
  });
});
