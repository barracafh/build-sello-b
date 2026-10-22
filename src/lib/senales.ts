// Señales de contenido (contexto.md §1.4, §5.4 y §5.6). Puro: sin red ni IA, y
// sin guardar ni registrar el texto. Las señales solo empujan hacia `no_oficial`:
// nunca suben un veredicto a `oficial_verificado`.
import { MARCAS, verificar, type Resultado } from "./verificar";

export type Senal = {
  codigo: string;
  nivel: "roja" | "naranja";
  // Frase para el ciudadano.
  texto: string;
};

// 1 y 3: los motivos de `verificar()` que se muestran como señal.
const DE_URL: Record<string, Senal> = {
  dominio_desconocido: {
    codigo: "enlace_no_listado",
    nivel: "naranja",
    texto: "El enlace no es de ninguna web oficial que conozcamos.",
  },
  inquilino_no_listado: {
    codigo: "enlace_no_listado",
    nivel: "naranja",
    texto: "El enlace no es de ninguna web oficial que conozcamos.",
  },
  gob_es_no_listado: {
    codigo: "enlace_no_listado",
    nivel: "naranja",
    texto: "El enlace no es de ninguna web oficial que conozcamos.",
  },
  acortador_no_resuelto: {
    codigo: "enlace_acortado",
    nivel: "naranja",
    texto: "El enlace está acortado y esconde adónde lleva.",
  },
  posible_imitacion_de_marca: {
    codigo: "enlace_parecido",
    nivel: "naranja",
    texto: "El enlace se parece al nombre de un organismo oficial.",
  },
  imitacion_de_marca: {
    codigo: "enlace_imita_oficial",
    nivel: "roja",
    texto: "El enlace imita el nombre de un organismo oficial.",
  },
  marca_como_subdominio: {
    codigo: "enlace_imita_oficial",
    nivel: "roja",
    texto: "El enlace usa el nombre de una web oficial para disfrazar otra.",
  },
  ip_como_host: {
    codigo: "enlace_imita_oficial",
    nivel: "roja",
    texto: "El enlace lleva a un número en vez de a un nombre de web.",
  },
  credenciales_en_url: {
    codigo: "enlace_imita_oficial",
    nivel: "roja",
    texto: "El enlace esconde la web real detrás de un @.",
  },
};

const L = String.raw`(?<![\p{L}\d])`;
const R = String.raw`(?![\p{L}\d])`;
// Palabra completa: `pin` no entra en «opinión» ni `nie` en «nieto». Una raíz
// de verbo se escribe con `\p{L}*` para aceptar sus terminaciones.
const palabra = (cuerpo: string) => `${L}(?:${cuerpo})${R}`;
const regla = (cuerpo: string) => new RegExp(palabra(cuerpo), "iu");
const cerca = (a: string, b: string, n = 50) => {
  const [x, y] = [palabra(a), palabra(b)];
  return new RegExp(`${x}[^.!?\\n]{0,${n}}${y}|${y}[^.!?\\n]{0,${n}}${x}`, "iu");
};

// Una frase que dice lo que el organismo NO hace no es una petición.
const NEGACION = /\b(nunca|jam[aá]s|no le (?:pedir|solicit)|no (?:pedimos|solicitamos))/i;
const sinNegaciones = (texto: string) =>
  texto.split(/(?<=[.!?\n])/).filter((f) => !NEGACION.test(f)).join(" ");

const CLAVE_PIN = /cl[@a]ve\s+(?:permanente\s+)?pin/gi;

const URGENCIA = [
  regla(String.raw`(?:24|48|72)\s?(?:horas|h)`),
  regla(String.raw`[uú]ltim[oa]\s+(?:aviso|recordatorio|oportunidad)`),
  regla(String.raw`inmediatamente|de inmediato|urgente`),
  cerca(String.raw`(?:9|nueve)\s+d[ií]as`, String.raw`descuento|reducci[oó]n|\d+\s?%`),
];
const AMENAZA = [
  regla(String.raw`arresto|detenci[oó]n|detenid[oa]|embargo|embargar`),
  regla(String.raw`orden de b[uú]squeda|publicaci[oó]n en (?:los )?medios|ser[aá] publicad[oa]`),
];
const PALABRAS_SIN_TILDE = [
  "devolucion", "informacion", "notificacion", "resolucion", "sancion",
  "tramitacion", "cancelacion", "actualizacion", "direccion", "comunicacion",
];
const ORTOGRAFIA = [
  /Ã[\u0080-¿¡-ÿ]|�/,
  /\d¿|¿(?=\s|$)/,
  regla(PALABRAS_SIN_TILDE.join("|")),
];
// Solo formas dirigidas al ciudadano: «facilitamos» o «enviamos» son del organismo.
const PEDIR =
  String.raw`facilite|facil[ií]tenos|env[ií]e|env[ií]enos|confirme|conf[ií]rmenos|proporcione|proporci[oó]nenos|actualice|indique|ind[ií]quenos|introduzca|introduce|comunique|comun[ií]quenos`;

// Solo una petición dirigida al ciudadano: un imperativo o un infinitivo tras
// «debe», «para»…; «puede pagar» informa, no pide. Listas cerradas: un
// sustantivo («pago», «importe», «tasa») no basta, y sin raíces abiertas
// «pagina» o «paginación» no entran.
const DINERO = [
  regla(String.raw`paguen?|abonen?|transfieran?`),
  // «ingrese» también es «entre» («ingrese en la sede»): solo cuenta con dinero detrás.
  // «cuenta» solo con una marca bancaria detrás: «su cuenta de Cl@ve» es un acceso.
  // La cifra admite espacios: «1 500 €», y `sinNegaciones` deja «1.500» como «1. 500».
  regla(
    String.raw`ingresen?(?:\s+[^\s.!?]+){0,2}?\s+(?:(?:(?:el|la)\s+)?(?:importe|cantidad|pago)|\d(?:[\d.,]|\s(?=\d))*\s?(?:€|euros?)|en\s+(?:la|esta)\s+cuenta\s+(?:ES\d{2,}|bancaria|indicada|siguiente|n[º°]|n[uú]mero))`,
  ),
  regla(String.raw`(?:realice|efect[uú]e)\s+(?:el\s+)?(?:pago|ingreso|abono)`),
  regla(String.raw`(?:debe|tiene\s+que|deber[aá]|para)\s+(?:pagar|abonar|ingresar|transferir)`),
];
const DATOS = [
  regla(String.raw`cvv2?|cvc|contrase[ñn]a|password|iban`),
  regla(String.raw`n[uú]mero de (?:la )?tarjeta|datos (?:bancarios|de (?:la |su )?tarjeta)|fecha de caducidad`),
  cerca(
    PEDIR,
    String.raw`dni|nif|nie|pasaporte`,
    40,
  ),
  // El PIN solo cuenta si se pide o va junto a la tarjeta; «Cl@ve PIN» es un acceso oficial.
  cerca(
    PEDIR,
    String.raw`pin`,
    25,
  ),
  cerca(String.raw`tarjeta|cvv|cvc`, String.raw`pin`, 25),
];
const QR = [regla(String.raw`c[oó]digo qr|qr|escane(?:a|e|ar|en)`)];
const INSTRUCCION = [
  regla(String.raw`responda?\s+a\s+este\s+(?:correo|mensaje|email)`),
  regla(String.raw`descargu?e\s+(?:la|esta|nuestra)\s+(?:app|aplicaci[oó]n)`),
  regla(String.raw`807[\s.-]?\d{3}[\s.-]?\d{3}`),
];
// §5.6.3: los únicos números verificados.
const TELEFONOS_VERIFICADOS = new Set(["060", "017", ["900", "116", "117"].join(""), ["91", "926", "79", "70"].join("")]);
const LLAMADA = cerca(
  String.raw`llam\p{L}*|ll[aá]m\p{L}*|contact\p{L}*|tel[eé]fonos?|telefonee`,
  String.raw`\+?(?:34)?[\s.-]?\d[\d\s.-]{1,12}\d`,
  30,
);
const NUMERO = /(?<!\d)(?:\+?34[\s.-]?)?(\d(?:[\s.-]?\d){2,8})(?!\d)/g;

const algunaCoincide = (patrones: RegExp[], texto: string) =>
  patrones.some((p) => p.test(texto));

function telefonosAjenos(texto: string): string[] {
  const salida: string[] = [];
  for (const frase of texto.split(/(?<=[.!?\n])/)) {
    if (!LLAMADA.test(frase)) continue;
    for (const m of frase.matchAll(NUMERO)) {
      const digitos = m[1].replace(/\D/g, "");
      if (digitos.length < 3 || /^807/.test(digitos)) continue;
      if (!TELEFONOS_VERIFICADOS.has(digitos)) salida.push(digitos);
    }
  }
  return salida;
}

const ESCAPES = [[/\[\.\]|\(\.\)|\[dot\]/gi, "."], [/\[@\]|\(at\)|\[at\]/gi, "@"]] as const;
const limpiar = (texto: string) =>
  ESCAPES.reduce((t, [de, a]) => t.replace(de, a), texto);

const CORREO = /([\p{L}\d._%+-]+)@([\p{L}\d-]+(?:\.[\p{L}\d-]+)+)/gu;
const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const MARCA_EN_NOMBRE = [...MARCAS, "agenciatributaria", "seguridadsocial", "trafico", "carpetaciudadana"];

function remitenteFalso(texto: string): boolean {
  const limpio = limpiar(texto);
  for (const m of limpio.matchAll(CORREO)) {
    const visible = limpio.slice(Math.max(0, m.index - 60), m.index).split(/[\n:]/).pop() ?? "";
    const nombre = normalizar(`${m[1]}${visible.replace(/<\s*$/, "")}`);
    if (!MARCA_EN_NOMBRE.some((marca) => nombre.includes(normalizar(marca)))) continue;
    if (verificar(`https://${m[2]}`).veredicto !== "oficial_verificado") return true;
  }
  return false;
}

export function senales(texto: string, resultadoUrl: Resultado): Senal[] {
  const fuera: Senal[] = [];
  const poner = (s: Senal) => {
    if (!fuera.some((x) => x.codigo === s.codigo)) fuera.push(s);
  };

  for (const motivo of resultadoUrl.motivos) {
    const s = DE_URL[motivo];
    if (s) poner(s);
  }

  if (algunaCoincide(AMENAZA, texto)) {
    poner({ codigo: "amenaza", nivel: "roja", texto: "Amenaza con consecuencias graves, como embargos o detenciones." });
  }
  if (algunaCoincide(URGENCIA, texto)) {
    poner({ codigo: "urgencia", nivel: "naranja", texto: "Mete prisa con un plazo corto o un «último aviso»." });
  }
  if (algunaCoincide(ORTOGRAFIA, texto)) {
    poner({ codigo: "ortografia", nivel: "naranja", texto: "Tiene faltas o símbolos raros, algo poco habitual en un organismo oficial." });
  }
  if (remitenteFalso(texto)) {
    poner({ codigo: "remitente_falso", nivel: "roja", texto: "El remitente usa el nombre de un servicio oficial con otra dirección." });
  }

  const pedido = sinNegaciones(texto).replace(CLAVE_PIN, "clave");
  if (algunaCoincide(DINERO, pedido)) {
    poner({ codigo: "pide_dinero", nivel: "roja", texto: "Pide dinero o el pago de una multa o tasa." });
  }
  if (algunaCoincide(DATOS, pedido)) {
    poner({ codigo: "pide_datos", nivel: "roja", texto: "Pide datos de tarjeta, claves, IBAN o datos personales." });
  }

  if (algunaCoincide(QR, texto)) {
    poner({ codigo: "instruccion_qr", nivel: "roja", texto: "Pide escanear un código QR." });
  }
  if (algunaCoincide(INSTRUCCION, texto) || telefonosAjenos(texto).length > 0) {
    poner({ codigo: "instruccion_rara", nivel: "naranja", texto: "Pide responder, descargar algo o llamar a un número que no es oficial." });
  }
  return fuera;
}

// Los cinco organismos del §5.4 (apartado 4.2).
const ORGANISMOS = [
  regla(String.raw`aeat|agencia tributaria|agenciatributaria|hacienda`),
  regla(String.raw`dgt|direcci[oó]n general de tr[aá]fico|tr[aá]fico`),
  regla(String.raw`seguridad social|seg-social|tgss`),
  regla(String.raw`sepe|servicio p[uú]blico de empleo|prestaci[oó]n por desempleo`),
  regla(String.raw`correos`),
];

export function suplantaOrganismo(texto: string, resultadoUrl: Resultado): boolean {
  const entidad = resultadoUrl.entidad ?? "";
  return algunaCoincide(ORGANISMOS, `${limpiar(texto)} ${entidad}`);
}

// Las señales solo empujan hacia `no_oficial`. Una roja con suplantación de uno de
// los cinco organismos da `no_oficial`, lleve enlace o no. Si la URL es una
// coincidencia exacta de la allowlist, o una web oficial citada sin esquema, el
// contenido sospechoso solo la baja a `no_determinable`. En cualquier otro caso
// manda el veredicto de la URL.
export function combinar(resultadoUrl: Resultado, lista: Senal[], texto: string): Resultado {
  const roja = lista.some((s) => s.nivel === "roja");
  if (roja && resultadoUrl.veredicto === "oficial_verificado") {
    return {
      ...resultadoUrl,
      veredicto: "no_determinable",
      motivos: ["contenido_sospechoso", ...resultadoUrl.motivos],
    };
  }
  // `web_oficial_citada` sigue primero: la interfaz lo lee de `motivos[0]`.
  if (
    roja &&
    resultadoUrl.veredicto === "no_determinable" &&
    resultadoUrl.motivos[0] === "web_oficial_citada"
  ) {
    return {
      ...resultadoUrl,
      veredicto: "no_determinable",
      motivos: [...resultadoUrl.motivos, "contenido_sospechoso"],
    };
  }
  if (
    roja &&
    resultadoUrl.veredicto !== "no_oficial" &&
    suplantaOrganismo(texto, resultadoUrl)
  ) {
    return {
      ...resultadoUrl,
      veredicto: "no_oficial",
      motivos: ["contenido_fraudulento", ...resultadoUrl.motivos],
    };
  }
  return resultadoUrl;
}
