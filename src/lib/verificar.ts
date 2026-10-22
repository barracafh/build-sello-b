// Verificador determinista de URLs (contexto.md §5.2). Puro: sin red, sin DNS,
// sin abrir ni seguir nada de lo que analiza, y sin guardar el texto.
import { domainToUnicode } from "node:url";
import { parse } from "tldts";
import { desneutralizar, extraerEnlace, neutralizar } from "./url";
import dominios from "../../datos/dominios-oficiales.json";
import { incibe165, indicadores } from "../datos/indicadores";

export type Veredicto = "oficial_verificado" | "no_oficial" | "no_determinable";

export type Resultado = {
  veredicto: Veredicto;
  // El primero es el motivo principal; el resto son avisos (p. ej. `sin_cifrado`).
  motivos: string[];
  web_oficial?: string;
  entidad?: string;
  fuente?: string;
  // Aviso público que da el dominio por fraudulento (INCIBE, Seguridad Social…).
  indicador?: { nombre: string; url: string; fecha: string };
  // Remitente de correo que motiva el veredicto, neutralizado (nunca un enlace).
  remitente_analizado?: string;
  // Aviso de INCIBE que respalda el caso, si lo hay.
  aviso?: { nombre: string; url: string };
  url_analizada: string | null;
};

type Entidad = (typeof dominios.entidades)[number];

const ACORTADORES = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
  "cutt.ly", "ow.ly", "acortar.link", "shorturl.at", "rebrand.ly",
];
const PLATAFORMAS = ["sedelectronica.es", "sedipualba.es", "sede.dival.es", "sede.gob.es"];
export const MARCAS = [
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

// Esqueleto UTS #39 reducido: los confundibles cirílicos y griegos más usados,
// a su letra latina.
const CONFUNDIBLES: Record<string, string> = {
  а: "a", в: "b", е: "e", ё: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c",
  т: "t", у: "y", х: "x", і: "i", ї: "i", ј: "j", ѕ: "s", ԁ: "d", ɡ: "g", ӏ: "l",
  α: "a", ε: "e", ι: "i", κ: "k", ν: "v", ο: "o", ρ: "p", τ: "t", υ: "u", χ: "x",
};
const esqueleto = (texto: string) =>
  [...texto].map((c) => CONFUNDIBLES[c] ?? c).join("");
const mezclaAlfabetos = (etiqueta: string) =>
  /\p{Script=Latin}/u.test(etiqueta) &&
  /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(etiqueta);

const entradaDe = (host: string[]) =>
  entradas
    .filter((e) => terminaEn(host, e.partes))
    .sort((a, b) => b.partes.length - a.partes.length)[0];

const indicadorDe = (registrable: string) =>
  indicadores.find((i) => i.dominio === registrable);

const ES_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

// Remitentes de correo: el nombre del servicio con un dominio ajeno es señal de
// fraude; un dominio de la lista no prueba nada, porque el remitente se puede
// falsificar.
// La marca cuenta por token completo: `seg-social` es la secuencia `seg`,
// `social`, así que `enclave-hotel` o `sepes` no coinciden con `clave` ni `sepe`.
// `hacienda` y `clave` son palabras y apellidos corrientes: en un remitente no
// bastan (`juan.clave@gmail.com`). En enlaces siguen, porque allí la imitación de
// marca ya pide una segunda señal.
const MARCAS_REMITENTE = MARCAS.filter((m) => m !== "hacienda" && m !== "clave");
const tokens = (texto: string) => texto.split(/[.\-_]/).filter(Boolean);
const marcaEnTokens = (partes: string[]) =>
  MARCAS_REMITENTE.find((marca) => contiene(partes, marca.split("-")));
const AVISOS_POR_MARCA: Record<string, { nombre: string; url: string }> = {
  carpetaciudadana: incibe165,
};

function remitentesAjenos(texto: string) {
  const motivos: string[] = [];
  let entidad: Entidad | undefined;
  let analizado: string | undefined;
  let aviso: { nombre: string; url: string } | undefined;
  for (const token of texto.split(/\s+/)) {
    const m = /^([^@/\s]+)@([^@/\s]+\.[^@/\s]+)$/.exec(
      desneutralizar(token).replace(/^[([{<"'«“]+/, "").replace(/[.,;:!?)}>»”]+$/, "").toLowerCase(),
    );
    if (!m) continue;
    const [, local, dominio] = m;
    const host = etiquetas(dominio);
    const registrable = parse(dominio, { allowPrivateDomains: true }).domain ?? dominio;
    if (indicadorDe(registrable)) motivos.push("indicador_publicado");
    if (entradaDe(host)) continue;
    const marca = marcaEnTokens([...tokens(local), ...host.flatMap(tokens)]);
    if (marca) {
      motivos.push("remitente_dominio_ajeno");
      entidad ??= entidadDeMarca(marca);
      analizado ??= neutralizar(`${local}@${dominio}`);
      aviso ??= AVISOS_POR_MARCA[marca];
    }
  }
  return motivos.length > 0
    ? { motivos: [...new Set(motivos)], entidad, analizado, aviso }
    : null;
}

export function verificar(texto: string): Resultado {
  const base = verificarEnlace(texto);
  const remitente = remitentesAjenos(texto);
  if (!remitente) return base;
  if (base.veredicto === "no_oficial") {
    return { ...base, motivos: [...new Set([...base.motivos, ...remitente.motivos])] };
  }
  return {
    ...base,
    veredicto: "no_oficial",
    motivos: [...remitente.motivos, ...base.motivos.filter((m) => m !== "sin_enlace")],
    ...(base.web_oficial ? {} : con(remitente.entidad)),
    ...(remitente.analizado ? { remitente_analizado: remitente.analizado } : {}),
    ...(remitente.aviso ? { aviso: remitente.aviso } : {}),
  };
}

function verificarEnlace(texto: string): Resultado {
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

  // Un dominio que un organismo ha publicado como fraude no depende de nada más.
  const indicador = indicadorDe(registrable);
  if (indicador) {
    const { fuente: f, fecha } = indicador;
    const sufijoInd = analisis.publicSuffix ?? "";
    const nombresInd = host.slice(0, host.length - etiquetas(sufijoInd).length);
    const marcaInd = MARCAS.find((m) => nombresInd.some((n) => n.includes(m)));
    const imita = marcaInd !== undefined || nombresInd.some(parecidoAMarca);
    return {
      ...devolver(
        "no_oficial",
        imita ? ["indicador_publicado", "imitacion_de_marca"] : ["indicador_publicado"],
        marcaInd ? entidadDeMarca(marcaInd) : undefined,
      ),
      indicador: { nombre: f.nombre, url: f.url, fecha },
    };
  }

  // 4. Homógrafos: el esqueleto del host Unicode coincide con la allowlist y el host no.
  const avisos0: string[] = [];
  if (nombre.includes("xn--")) {
    const unicode = domainToUnicode(nombre);
    if (unicode.split(".").some(mezclaAlfabetos)) avisos0.push("mezcla_de_alfabetos");
    const parecido = entradaDe(etiquetas(esqueleto(unicode)));
    if (parecido && !entradaDe(host)) {
      return devolver("no_oficial", ["homografo", ...avisos0], parecido.entidad);
    }
  }

  // 5. Plataformas compartidas: solo vale el host exacto de la allowlist.
  const plataforma = PLATAFORMAS.some((p) => terminaEn(host, etiquetas(p)));
  const exacta = entradas.find((e) => e.dominio === nombre);
  if (plataforma && !exacta) {
    return devolver("no_determinable", ["inquilino_no_listado"]);
  }

  // 6. Allowlist: dominio exacto o subdominio por etiquetas completas.
  // Gana la entrada más específica (`san.gva.es` antes que `gva.es`).
  const propia = exacta ?? entradaDe(host);
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
