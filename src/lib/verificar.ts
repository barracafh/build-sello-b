// Verificador determinista de URLs (contexto.md §5.2). Puro: sin red, sin DNS,
// sin abrir ni seguir nada de lo que analiza, y sin guardar el texto.
import { parse } from "tldts";
import { desneutralizar, extraerEnlace, neutralizar } from "./url";
import dominios from "../../datos/dominios-oficiales.json";

export type Veredicto = "oficial_verificado" | "no_oficial" | "no_determinable";

export type Resultado = {
  veredicto: Veredicto;
  // El primero es el motivo principal; el resto son avisos (p. ej. `sin_cifrado`).
  motivos: string[];
  web_oficial?: string;
  entidad?: string;
  fuente?: string;
  url_analizada: string | null;
};

type Entidad = (typeof dominios.entidades)[number];

const ACORTADORES = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
  "cutt.ly", "ow.ly", "acortar.link", "shorturl.at", "rebrand.ly",
];
const PLATAFORMAS = ["sedelectronica.es", "sedipualba.es", "sede.dival.es", "sede.gob.es"];
const MARCAS = [
  "dgt", "agenciatributaria", "seg-social", "sepe", "correos",
  "clave", "hacienda", "carpetaciudadana", "dehu",
];
const TLD_BARATOS = ["top", "click", "help", "cfd", "info", "xyz", "eu.cc"];
const PALABRAS_CONTENIDO =
  /pago|pagar|pagad|tarjeta|cvv|devoluci[oó]n|reembolso|multa|recargo|aduana/i;

const etiquetas = (host: string) => host.split(".");

// Compara etiquetas completas: `x.dgt.es` termina en `dgt.es`, `xdgt.es` no.
const terminaEn = (host: string[], sufijo: string[]) =>
  host.length >= sufijo.length &&
  sufijo.every((e, i) => host[host.length - sufijo.length + i] === e);

const contiene = (host: string[], tramo: string[]) =>
  host.some((_, i) => tramo.every((e, j) => host[i + j] === e));

const entradas = dominios.entidades.flatMap((entidad) =>
  entidad.dominios.map((dominio) => ({ entidad, dominio, partes: etiquetas(dominio) })),
);

function distancia(a: string, b: string): number {
  let fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const nueva = [i];
    for (let j = 1; j <= b.length; j++) {
      nueva[j] = Math.min(
        fila[j] + 1,
        nueva[j - 1] + 1,
        fila[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    fila = nueva;
  }
  return fila[b.length];
}

const parecidoAMarca = (etiqueta: string) =>
  MARCAS.some(
    (marca) =>
      etiqueta.includes(marca) ||
      distancia(etiqueta, marca) <= (marca.length >= 6 ? 2 : 1),
  );

const entidadDeMarca = (marca: string) =>
  dominios.entidades.find((e) =>
    e.dominios.some((d) => etiquetas(d).includes(marca)),
  );

const con = (entidad?: Entidad) =>
  entidad
    ? { entidad: entidad.entidad, web_oficial: entidad.web_oficial, fuente: entidad.fuente }
    : {};

const ES_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export function verificar(texto: string): Resultado {
  const enlace = extraerEnlace(texto);
  if (!enlace) {
    return { veredicto: "no_determinable", motivos: ["sin_enlace"], url_analizada: null };
  }
  const url_analizada = neutralizar(enlace.crudo);
  const devolver = (
    veredicto: Veredicto,
    motivos: string[],
    entidad?: Entidad,
  ): Resultado => ({ veredicto, motivos, ...con(entidad), url_analizada });

  const limpio = desneutralizar(enlace.crudo);
  let url: URL;
  try {
    url = new URL(enlace.conEsquema ? limpio : `http://${limpio}`);
  } catch {
    return devolver("no_determinable", ["url_no_valida"]);
  }

  // 2. IP (el parser ya pasa decimal/octal/hex a notación con puntos) y credenciales.
  const nombre = url.hostname.replace(/\.$/, "").toLowerCase();
  if (ES_IPV4.test(nombre) || nombre.startsWith("[")) {
    return devolver("no_oficial", ["ip_como_host"]);
  }
  if (url.username || url.password) {
    return devolver("no_oficial", ["credenciales_en_url"]);
  }

  const host = etiquetas(nombre);
  const analisis = parse(nombre, { allowPrivateDomains: true });
  const registrable = analisis.domain;
  if (!registrable) return devolver("no_determinable", ["dominio_desconocido"]);

  // 3. Acortadores.
  if (ACORTADORES.includes(registrable)) {
    return devolver("no_determinable", ["acortador_no_resuelto"]);
  }

  // 5. Plataformas compartidas: solo vale el host exacto de la allowlist.
  const plataforma = PLATAFORMAS.some((p) => terminaEn(host, etiquetas(p)));
  const exacta = entradas.find((e) => e.dominio === nombre);
  if (plataforma && !exacta) {
    return devolver("no_determinable", ["inquilino_no_listado"]);
  }

  // 6. Allowlist: dominio exacto o subdominio por etiquetas completas.
  // Gana la entrada más específica (`san.gva.es` antes que `gva.es`).
  const propia =
    exacta ??
    entradas
      .filter((e) => terminaEn(host, e.partes))
      .sort((a, b) => b.partes.length - a.partes.length)[0];
  if (propia) {
    const avisos: string[] = [];
    if (enlace.conEsquema && url.protocol === "http:") avisos.push("sin_cifrado");
    if (url.port) avisos.push("puerto_no_estandar");
    // Una web citada en prosa, sin enlace, no confirma el mensaje que la cita.
    const sueltas = texto.replace(enlace.crudo, "").trim().length > 0;
    if (!enlace.conEsquema && sueltas) {
      return devolver("no_determinable", ["sin_enlace"], propia.entidad);
    }
    return devolver("oficial_verificado", ["en_allowlist", ...avisos], propia.entidad);
  }

  // 7. *.gob.es fuera de la allowlist: sin DNS no distinguimos uno real de uno inventado.
  if (host.length > 2 && terminaEn(host, ["gob", "es"])) {
    return devolver("no_determinable", ["gob_es_no_listado"]);
  }

  // 8. Dominio oficial usado como subdominio de otro registrable.
  const imitada = entradas.find((e) => contiene(host, e.partes));
  if (imitada) {
    return devolver("no_oficial", ["marca_como_subdominio"], imitada.entidad);
  }

  // 9. Marca en un registrable ajeno: solo concluye con una segunda señal.
  const sufijo = analisis.publicSuffix ?? "";
  const nombres = host.slice(0, host.length - etiquetas(sufijo).length);
  const marca = MARCAS.find((m) => nombres.some((n) => n.includes(m)));
  if (marca || nombres.some(parecidoAMarca)) {
    const entidad = marca ? entidadDeMarca(marca) : undefined;
    const sinEnlace = texto.replace(enlace.crudo, "");
    if (TLD_BARATOS.includes(sufijo) || PALABRAS_CONTENIDO.test(sinEnlace)) {
      return devolver("no_oficial", ["imitacion_de_marca"], entidad);
    }
    return devolver("no_determinable", ["posible_imitacion_de_marca"], entidad);
  }

  // 10.
  return devolver("no_determinable", ["dominio_desconocido"]);
}
