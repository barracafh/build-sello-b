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

describe("avisos que citan la web oficial sin enlace", () => {
  const porId = (id: string) => ejemplos.find((c) => c.id === id) as Ejemplo;
  for (const [id, entidad] of [
    ["L01", "Agencia Tributaria"],
    ["L02", "Dirección General de Tráfico"],
    ["L03", "Correos"],
    ["L04", "Dirección Electrónica Habilitada"],
  ]) {
    test(`${id} reconoce la web oficial citada`, () => {
      const r = verificar(textoDeEjemplo(porId(id)));
      assert.equal(r.veredicto, "no_determinable");
      assert.equal(r.motivos[0], "web_oficial_citada", r.motivos.join());
      assert.ok(r.entidad?.includes(entidad), r.entidad);
      assert.ok(r.web_oficial?.startsWith("https://"));
      assert.ok(r.url_analizada?.includes("[.]"), r.url_analizada ?? "");
    });
  }
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
  esperar("http://[broken", "no_oficial", "url_no_valida");
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
    const r = verificar("Consulta sede.dgt.gob.es");
    assert.equal(r.veredicto, "no_determinable");
    assert.deepEqual(r.motivos, ["web_oficial_citada"]);
    assert.ok(r.web_oficial);
  });
  test("sede.dival.es exacto es oficial, un inquilino no", () => {
    assert.equal(verificar("https://sede.dival.es").veredicto, "oficial_verificado");
    assert.equal(verificar("https://rocafort.sede.dival.es").veredicto, "no_determinable");
  });
});

describe("indicadores publicados", () => {
  esperar("https://actc.center/x", "no_oficial", "indicador_publicado");
  esperar("actc[.]center", "no_oficial", "indicador_publicado");
  test("un indicador con marca suma la imitación", () => {
    const r = verificar("portal.seg-socioal.cfd");
    assert.deepEqual(r.motivos.slice(0, 2), ["indicador_publicado", "imitacion_de_marca"]);
    assert.ok(r.indicador?.url.startsWith("https://"));
  });
});

describe("homógrafos", () => {
  esperar("https://xn--crreos-wqf.es/", "no_oficial", "homografo");
  test("un host con xn-- que no imita la allowlist no es homógrafo", () => {
    const r = verificar("https://xn--espaa-rta.com/");
    assert.notEqual(r.veredicto, "no_oficial");
  });
});

describe("remitente de correo", () => {
  const correo = (local: string, dominio: string) => [local, dominio].join("@");
  test("el nombre del servicio con otro dominio es no_oficial", () => {
    const r = verificar(
      `De: ${correo("carpetaciudadana", "info[.]com[.]es")}. Responda a este correo.`,
    );
    assert.equal(r.veredicto, "no_oficial");
    assert.ok(r.motivos.includes("remitente_dominio_ajeno"), r.motivos.join());
    assert.ok(r.web_oficial);
  });
  test("un remitente del dominio oficial no prueba nada", () => {
    const r = verificar(`De: ${correo("correos", "correos.com")}. Tu envío está en camino.`);
    assert.equal(r.veredicto, "no_determinable");
  });
  test("un remitente sin marca en un dominio desconocido no concluye", () => {
    const r = verificar(`De: ${correo("hola", "ejemplo.com")}. Buenas tardes.`);
    assert.equal(r.veredicto, "no_determinable");
  });
});

describe("remitente: la marca cuenta por token completo", () => {
  const correo = (local: string, dominio: string) => [local, dominio].join("@");
  const veredictoDe = (local: string, dominio: string) =>
    verificar(`De: ${correo(local, dominio)}. Buenas tardes.`);

  for (const [local, dominio] of [
    ["pepe.sepeda", "gmail.com"],
    ["info", "enclave-hotel.com"],
    ["ana", "clavería.com"],
    ["madgtr", "gmail.com"],
    ["info", "dehumidificadores.es"],
    ["rrhh", "sepes.es"],
    ["info", "correosexpress.com"],
    ["info", "hacienda-lasrosas.com"],
    ["juan.clave", "gmail.com"],
  ]) {
    test(`${local}@${dominio} → no_determinable`, () => {
      const r = veredictoDe(local, dominio);
      assert.equal(r.veredicto, "no_determinable");
      assert.ok(!r.motivos.includes("remitente_dominio_ajeno"));
    });
  }

  for (const [local, dominio] of [
    ["carpetaciudadana", "info.com.es"],
    ["dgt-multas", "gmail.com"],
    ["seg-social", "ejemplo.com"],
    ["trafico", "gmail.com"],
    ["seguridadsocial", "gmail.com"],
    ["dgtmultas", "gmail.com"],
  ]) {
    test(`${local}@${dominio} → no_oficial`, () => {
      const r = veredictoDe(local, dominio);
      assert.equal(r.veredicto, "no_oficial");
      assert.ok(r.motivos.includes("remitente_dominio_ajeno"), r.motivos.join());
    });
  }

  test("la marca unida en la parte local resuelve su entidad", () => {
    assert.match(veredictoDe("trafico", "gmail.com").web_oficial ?? "", /dgt\.gob\.es/);
    assert.match(veredictoDe("seguridadsocial", "gmail.com").web_oficial ?? "", /seg-social/);
  });

  test("solo remitente: lo devuelve neutralizado y con el aviso de INCIBE", () => {
    const r = veredictoDe("carpetaciudadana", "info.com.es");
    assert.equal(r.url_analizada, null);
    assert.equal(r.remitente_analizado, "carpetaciudadana@info[.]com[.]es");
    assert.match(r.aviso?.url ?? "", /mi-carpeta-ciudadana-no-esta-enviando/);
  });
});
