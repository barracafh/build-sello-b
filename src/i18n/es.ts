// Castellano: la fuente de verdad. Cada clave que se añade aquí la tienen que
// traer los otros idiomas, o `bun run typecheck` falla (ver `Diccionario`).
// Los nombres oficiales (Agencia Tributaria, Seguridad Social, DGT, Correos,
// INCIBE), el 017, las URL y los dominios no se traducen.
import { deEntidad } from "@/lib/veredicto";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const es = {
  saltarContenido: "Saltar al contenido",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    frase: "Comprueba antes de confiar.",
    secciones: "Secciones",
    datosReales: "Datos públicos",
    datosSimulados: "Datos simulados",
  },
  pagina: {
    titulo: "¿Este mensaje es de verdad?",
  },
  pie: {
    descripcion: (nombre: string) =>
      `${nombre} es una herramienta independiente para ayudarte a identificar posibles fraudes.`,
    // Aviso obligatorio (regla 5 de la plataforma): no se quita en ningún idioma.
    aviso: "Herramienta experimental. No es un servicio oficial.",
    organismos: "Organismos oficiales",
    ayuda: "Información y ayuda",
    llamar017: "Llamar al 017",
    linea017: "Línea 017 de INCIBE",
    avisosIncibe: "Avisos de INCIBE",
    sobre: "Sobre la herramienta",
    privacidad: "No guardamos lo que pegas ni abrimos sus enlaces.",
    squad: "Squad",
  },
  botonAviso: "¿Algo está mal? Avísanos",
  // Veredictos: solo el texto. Iconos y colores siguen en VEREDICTOS (src/lib/veredicto.ts).
  veredictos: {
    no_oficial: {
      etiqueta: "No es oficial",
      titular: ({ entidad, hayEnlace }: ContextoTitular) => {
        const que = hayEnlace ? "Este enlace" : "Este mensaje";
        return entidad ? `${que} no es ${deEntidad(entidad)}` : `${que} no es oficial`;
      },
      entradilla: "No pulses sus enlaces y no respondas al mensaje.",
      pasos: [
        "No pulses el enlace ni respondas al mensaje.",
        "Si quieres comprobar algo, entra tú en la web oficial escribiendo la dirección.",
        "Si ya lo has pulsado o has dado datos, llama gratis al 017.",
      ],
    },
    no_determinable: {
      etiqueta: "No podemos confirmarlo",
      titular: ({ entidad }: ContextoTitular) =>
        entidad
          ? `No podemos confirmar que sea ${deEntidad(entidad)}`
          : "No podemos saber quién lo envía",
      entradilla: "Que el texto parezca oficial no prueba quién lo envía.",
      pasos: [
        "No pulses el enlace ni respondas al mensaje.",
        "Entra tú en la web oficial escribiendo la dirección.",
        "Si dudas, llama gratis al 017.",
      ],
    },
    oficial_verificado: {
      etiqueta: "Web oficial",
      titular: ({ entidad }: ContextoTitular) =>
        entidad
          ? `Esta web es ${deEntidad(entidad)}`
          : "Esta web está en nuestra lista de webs oficiales",
      entradilla:
        "Solo comprobamos la dirección, no lo que te pidan dentro. Para volver a entrar, escribe tú la dirección.",
      pasos: [
        "Aun así, no des datos si no lo esperabas.",
        "Si dudas, entra tú escribiendo la dirección de la web oficial.",
        "Si ya has dado datos, llama gratis al 017 de INCIBE.",
      ],
    },
  },
  analizar: {
    // Una sola frase, que es la etiqueta de la caja; `negrita` va resaltada.
    campo: {
      antes: "Pega aquí el SMS, el correo o la web tal como te ha llegado, ",
      negrita: "sin pulsar ningún enlace",
      despues: ", y te decimos si podemos confirmarlo.",
    },
    placeholder:
      "DGT: Dispone de 24 horas para pagar su multa. Consulte en el siguiente enlace: hxxps://…",
    contador: (actual: string, maximo: string) => `${actual} de ${maximo} caracteres como máximo`,
    subirCaptura: "Subir captura",
    leyendoImagen: "Leyendo la imagen…",
    ayudaImagen: "Captura en PNG, JPG o WebP, hasta 4 MB.",
    comprobar: "Comprobar mensaje",
    comprobarCorto: "Comprobar",
    leyendoCorto: "Leyendo…",
    comprobando: "Comprobando…",
    privacidad: "No guardamos lo que pegas ni las imágenes, ni abrimos sus enlaces.",
    ejemplos: "¿Quieres probar con un ejemplo?",
    deberiaDar: "Debería dar: ",
    fraude: "Fraude",
    legitimo: "Legítimo",
    porQue: "Por qué lo decimos",
    sinCifrado: "Eso sí, el enlace no está cifrado (http).",
    suplanta: "Intenta hacerse pasar por:",
    senalesEncontradas: "Señales encontradas",
    senalRoja: "Señal roja",
    senalNaranja: "Señal naranja",
    otraSenal: "Otra señal",
    remitente: "Remitente del mensaje",
    direccionCitada: "Dirección citada",
    direccion: "Dirección del mensaje",
    noLaAbras: "(no la abras):",
    webOficialEs: (entidad: string | null) =>
      entidad ? `La web oficial ${deEntidad(entidad)} es` : "La web oficial es",
    irWebOficial: "Ir a la web oficial",
    desmentidos: "Ya lo han desmentido",
    desmentidosTexto: "Verificadores de noticias han publicado sobre mensajes parecidos a este.",
    desmentidosNoPrueba: "Eso no prueba por sí solo que este sea falso.",
    queHacer: "Qué hacer ahora",
    dudas017: "¿Dudas o ya has dado datos?",
    linea017: "Línea 017 de INCIBE, gratuita y confidencial",
    // Horario de la línea 017, tal como lo da SETUP.md.
    horario017: "De 8:00 a 23:00, los 365 días.",
    llamar017: "Llamar al 017",
    fuentesYDatos: "Fuentes y datos de la comprobación",
    reputacion: "Reputación del enlace:",
    noConsultada: "no consultada",
    registro: "Registro del dominio:",
    noDisponible: "no disponible",
    copiarEnlace: "Copiar enlace a este resultado",
    otroMensaje: "Comprobar otro mensaje",
    avisoEnlace:
      "El mensaje va dentro del enlace y no llega a nuestro servidor, pero quien tenga el enlace podrá leerlo. No lo compartas si lleva datos personales.",
    enlaceCopiado: "Enlace copiado. Quien lo abra verá este mensaje y su resultado.",
    enlaceNoCopiado:
      "No hemos podido copiarlo. El enlace ya está en la barra de direcciones: cópialo desde ahí.",
    criterios: (apartados: string) => `Criterios de Sello (contexto.md${apartados})`,
    avisosIncibe: "INCIBE · Avisos a la ciudadanía",
    sinClasificadorOficial:
      "La dirección está en nuestra lista de webs oficiales. No hemos podido analizar el resto del texto ahora mismo.",
    sinClasificador:
      "No hemos podido analizar el texto del mensaje ahora mismo, así que no podemos confirmar nada. Las señales que ves salen de reglas fijas.",
    motivoSuplantacion: "El mensaje tiene señales claras de suplantación.",
    webCitadaDe: (entidad: string) =>
      `El mensaje cita una dirección que sí es la web oficial de ${entidad}. Eso no prueba quién lo envía: entra tecleando tú la dirección.`,
  },
  errores: {
    vacio: "Escribe o pega un mensaje antes de comprobar.",
    largo: (actual: string, maximo: string) =>
      `El mensaje es demasiado largo: tiene ${actual} caracteres y el máximo es ${maximo}.`,
    red: "No hemos podido comprobarlo. Inténtalo de nuevo.",
    imagenSinTexto: "No hemos encontrado texto en la imagen. Copia el mensaje y pégalo.",
    // Errores de /api/imagen, por su `codigo`.
    imagen: {
      ia: "No hemos podido leer la imagen. Copia el texto del mensaje y pégalo.",
      elegir: "Elige una imagen para leerla.",
      vacia: "La imagen está vacía.",
      grande: "La imagen ocupa más de 4 MB.",
      tipo: "La imagen tiene que ser PNG, JPG o WebP.",
    },
  },
  // Frase corta para cada código de `motivos` (LAB-34/38); el código nunca se muestra solo.
  motivos: {
    contenido_sospechoso:
      "La web del enlace figura como oficial, pero el mensaje tiene señales de fraude: no podemos confirmarlo.",
    contenido_fraudulento:
      "El mensaje usa el nombre de un organismo oficial y tiene señales claras de fraude.",
    sin_enlace: "No hemos encontrado ningún enlace en el mensaje.",
    web_oficial_citada:
      "El mensaje cita una dirección que sí es una web oficial. Eso no prueba quién lo envía: entra tecleando tú la dirección.",
    url_no_valida: "El enlace no tiene un formato que podamos leer.",
    ip_como_host:
      "El enlace lleva a un número en vez de a un nombre de web, algo que las webs oficiales no hacen.",
    credenciales_en_url:
      "El enlace esconde la web real detrás de un @: lo que parece el nombre es solo un disfraz.",
    acortador_no_resuelto: "Es un enlace acortado y no lo abrimos, así que no sabemos adónde lleva.",
    inquilino_no_listado:
      "Está en una plataforma que usan muchos ayuntamientos, pero no es una web que conozcamos.",
    gob_es_no_listado:
      "Termina en gob.es, reservado a administraciones, pero no sabemos de qué organismo es.",
    marca_como_subdominio: "Usa el nombre de una web oficial al principio, pero la web real es otra.",
    imitacion_de_marca: "Imita el nombre de un organismo oficial y tiene otras señales de fraude.",
    posible_imitacion_de_marca:
      "Se parece al nombre de un organismo oficial, pero no podemos asegurar que sea falsa.",
    dominio_desconocido: "No es una web que tengamos en nuestra lista de webs oficiales.",
    homografo: "El nombre usa letras de otro alfabeto para parecerse a una web oficial.",
    indicador_publicado: "Un organismo oficial ha avisado de que esta dirección es un fraude.",
    remitente_dominio_ajeno:
      "El remitente usa el nombre de un organismo oficial con una dirección de correo que no es la suya.",
    en_allowlist: "La dirección está en nuestra lista de webs oficiales.",
  },
  senales: {
    // Título de cada señal del clasificador (LAB-39).
    titulos: {
      pide_dinero: "Pide dinero",
      pide_datos: "Pide datos personales o bancarios",
      amenaza: "Amenaza con consecuencias graves",
      urgencia: "Mete prisa",
      ortografia: "Faltas o símbolos raros",
      remitente_falso: "Remitente que no cuadra",
      enlace_sospechoso: "Enlace sospechoso",
      enlace_no_listado: "Enlace que no conocemos",
      enlace_acortado: "Enlace acortado",
      enlace_parecido: "Enlace parecido a uno oficial",
      enlace_imita_oficial: "Enlace que imita a uno oficial",
      instruccion_qr: "Pide escanear un código QR",
      instruccion_rara: "Pide responder, descargar o llamar",
      devolucion_con_enlace: "Devolución con enlace para cobrar",
      aviso_informativo: "Parece un aviso informativo",
    },
    // Las señales fijas (src/lib/senales.ts) traen su texto en castellano, que
    // también va al prompt; en castellano se enseña tal cual.
    texto: (senal: { codigo: string; texto: string }) => senal.texto,
  },
  ejemplos: {
    F01: "Devolución de Hacienda (SMS)",
    F02: "Multa de la DGT (SMS)",
    F03: "Paquete de Correos (SMS)",
    F04: "Tarjeta de la Seguridad Social (SMS)",
    F05: "Recargo de una multa (correo)",
    L01: "Notificación de Hacienda (SMS)",
    L02: "Dirección Electrónica Vial (correo)",
    L03: "Seguimiento de un envío (correo)",
    L04: "Aviso de DEHú (correo)",
    L05: "Cita en el centro de salud (web)",
  },
  compartir: {
    titulo: "Mándaselo a tu familia",
    whatsapp: "Enviar por WhatsApp",
    otraVentana: " (se abre en otra ventana)",
    otraApp: "Otra app",
    copiar: "Copiar el texto",
    copiado: "Texto copiado. Pégalo en el chat de tu familia.",
    noCopiado: "No hemos podido copiarlo. Prueba con «Enviar por WhatsApp».",
    // Texto que se manda (src/lib/compartir.ts).
    meHaLlegado: "Me ha llegado este mensaje:",
    pie: (nombre: string, url: string) =>
      `Lo he comprobado con ${nombre}, una herramienta experimental que no es un servicio oficial: ${url}`,
    ayuda017: "Si dudas o ya has dado datos, llama gratis al 017 de INCIBE.",
    laWeb: (entidad: string | null, direccion: string) =>
      `La web oficial${entidad ? ` ${deEntidad(entidad)}` : ""} es ${direccion}`,
    noOficial: (entidad: string | null) =>
      `He comprobado ${entidad ? `un mensaje que dice ser ${deEntidad(entidad)}` : "un mensaje"}: NO es oficial.`,
    noPulsesUrl: (url: string) => `No pulses el enlace ni respondas: ${url}`,
    noRespondasRemitente: (remitente: string) => `No respondas a este remitente: ${remitente}`,
    noPulses: "No pulses sus enlaces ni respondas.",
    entraTu: "Si tienes que hacer algo, entra tú escribiendo la dirección.",
    oficial: (entidad: string | null, url: string | null) =>
      `He comprobado una web y está en la lista de webs oficiales${entidad ? ` ${deEntidad(entidad)}` : ""}${url ? `: ${url}` : "."}`,
    noDesDatos: "Aun así, no des datos si no lo esperabas.",
    dudaEntidad: (entidad: string) =>
      `He comprobado un mensaje que dice ser ${deEntidad(entidad)} y no se puede confirmar que lo sea.`,
    duda: "He comprobado un mensaje y no se puede saber quién lo envía.",
    citaOficial: "El mensaje cita la web oficial, pero eso no prueba quién lo envía.",
    mejorNoPulses: (url: string) => `Mejor no pulses el enlace: ${url}`,
    mejorNoRespondas: "Mejor no respondas ni pulses nada.",
    entraTuCorto: "Entra tú escribiendo la dirección.",
  },
  /** Mes y año de un desmentido: «marzo de 2025». `mes` va de 0 a 11. */
  mes: (mes: number, año: number) => `${MESES[mes]} de ${año}`,
  fuentes: {
    aria: "Fuentes",
    oficiales: "Fuentes oficiales",
    verificadores: "Verificadores",
  },
};

/** Lo que recibe el titular de cada veredicto. */
export type ContextoTitular = {
  /** Nombre de la entidad tal cual (DGT, Seguridad Social); null si la API no la da. */
  entidad: string | null;
  /** Si el mensaje traía un enlace. */
  hayEnlace: boolean;
};

// Los literales se ensanchan a `string` para que cada idioma ponga su texto.
type Ampliar<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Ampliar<R>
    : { readonly [K in keyof T]: Ampliar<T[K]> };

export type Diccionario = Ampliar<typeof es>;
