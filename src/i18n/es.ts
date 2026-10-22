// Castellano: la fuente de verdad. Cada clave que se añade aquí la tienen que
// traer los otros idiomas, o `bun run typecheck` falla (ver `Diccionario`).
// Los nombres oficiales (Agencia Tributaria, Seguridad Social, DGT, Correos,
// INCIBE), el 017, las URL y los dominios no se traducen.
import { deEntidad } from "@/lib/veredicto";
import ejemplos from "../../datos/mensajes-ejemplo.json";

// El texto y las tres primeras pistas de un caso de datos/mensajes-ejemplo.json.
const caso = (id: string) => {
  const { texto, pistas } = ejemplos.find((e) => e.id === id)!;
  return { texto, pistas: pistas.slice(0, 3) };
};

/** Remitente oficial de Correos del caso L03, tal cual el fichero (no se escribe a mano). */
export const REMITENTE_CORREOS = caso("L03").texto.match(/\S+@\S+\.com/)![0];

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const es = {
  saltarContenido: "Saltar al contenido",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    frase: "Comprueba antes de confiar.",
    secciones: "Secciones",
    datosReales: "Datos públicos",
    datosSimulados: "Datos simulados",
    // Secciones del menú; `corto` es el nombre en el móvil, para que las dos
    // quepan en una fila a 320 px.
    menu: {
      verificar: { nombre: "Comprobar un mensaje", corto: "Comprobar" },
      juego: { nombre: "Juego: ¿estafa o no?", corto: "¿Estafa o no?" },
    },
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
    criterios: (apartados: string) => `Criterios de Everdá (contexto.md${apartados})`,
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
    url_no_valida:
      "El enlace está incompleto o roto: no lo pulses; teclea tú la dirección del organismo.",
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
    posible_imitacion_de_marca: "Se parece al nombre de un organismo oficial, pero no es su web. Trátalo como un fraude.",
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
    pie: (nombre: string, url: string) =>
      `Lo he comprobado con ${nombre}: ${url}`,
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
  emergencia: {
    seccion: "Si ya has actuado",
    yaHasActuado: "¿Ya has actuado?",
    cuentanos: "Cuéntanos qué pasó y te decimos qué hacer ahora.",
    yaHePulsado: "Ya he pulsado →",
    queHiciste: "¿Qué hiciste?",
    marca: "Marca todo lo que corresponda.",
    pasosDebajo: "Los pasos aparecen debajo.",
    pasosDerecha: "Los pasos aparecen a la derecha.",
    cerrar: "Cerrar",
    accionesAria: "Acciones realizadas",
    anuncio: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"} para tu caso.`,
    vacio: "Aquí verás qué hacer, en orden.",
    marcaArriba: "Marca arriba lo que hiciste.",
    marcaIzquierda: "Marca a la izquierda lo que hiciste.",
    queHacerAhora: "Qué hacer ahora",
    cuantosPasos: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    grupos: { primero: "Primero, ahora mismo", despues: "Después", queHacer: "Qué hacer" },
    verPasos: (n: number) => `Ver tus ${n} ${n === 1 ? "paso" : "pasos"}`,
    // Fuentes del modo emergencia: «INCIBE» y «017» los pone el componente.
    fuentes: { linea: "Línea de ayuda en ciberseguridad", reporte: "Reporte de fraude" },
    // Una por AccionId de src/datos/pasos-emergencia.ts.
    acciones: {
      enlace: { label: "Pulsé el enlace", descripcion: "Abrí la web, pero no introduje nada" },
      tarjeta: { label: "Metí mis datos de tarjeta o bancarios", descripcion: "Número de tarjeta, CVV, cuenta…" },
      clave: { label: "Di mi contraseña de Cl@ve o mis datos de acceso", descripcion: "Usuario, contraseña o código recibido" },
      instale: { label: "Instalé algo o descargué un archivo", descripcion: "Una app, un adjunto…" },
      pague: { label: "Pagué", descripcion: "Hice una transferencia o un cargo" },
    },
    // Uno por PasoId de src/datos/pasos-emergencia.ts.
    pasos: {
      banco: "Llama ahora a tu banco y diles que bloqueen la tarjeta o la cuenta. El teléfono está en el reverso de la tarjeta.",
      "banco-pago": "Llama a tu banco, explícales lo que pasó y pregunta si pueden devolverte el dinero.",
      capturas: "Haz una foto con el móvil al mensaje que recibiste, para tenerlo guardado por si hace falta después.",
      "cambiar-clave": "Cambia tu contraseña de Cl@ve cuanto antes. Escribe tú mismo la dirección en el navegador, no pulses ningún enlace.",
      "revisar-dehu": "Entra en tu buzón de notificaciones y en tu Carpeta Ciudadana escribiendo tú mismo la dirección, y mira si hay algo raro.",
      "no-dispositivo": "No uses ese teléfono u ordenador para entrar al banco ni para poner contraseñas hasta que alguien de confianza lo revise.",
      "no-enlace": "No vuelvas a pulsar ese enlace ni llames al número que aparecía en el mensaje.",
      denuncia: "Pon una denuncia en la Policía Nacional o en la Guardia Civil. Puedes hacerlo por internet o yendo en persona.",
      "017": "Llama al 017, es gratis. Te atienden todos los días de 8 de la mañana a 11 de la noche y te explican exactamente qué hacer.",
      "reporte-incibe": "Avisa al organismo oficial de ciberseguridad (INCIBE) de lo que ha pasado.",
    },
  },
  // Leyenda del mensaje con las trampas subrayadas (MensajeSenalado).
  senalado: {
    titulo: "Así se ve en tu mensaje",
    continuo: "Subrayado continuo",
    trazos: "Subrayado a trazos",
    roja: "señal roja",
    naranja: "señal naranja",
  },
  // Mientras se comprueba (CargaResultado). Frases genéricas y ciertas: no hay
  // porcentajes ni pasos que el servidor no haga.
  carga: {
    pasos: ["Revisando el enlace…", "Buscando señales de estafa…", "Consultando fuentes oficiales…"],
    lenta: "Esto puede tardar unos segundos más.",
  },
  juego: {
    antetitulo: "Juego · 10 mensajes",
    titulo: "¿Estafa o no?",
    intro:
      "Cinco estafas reales avisadas por INCIBE y cinco avisos de verdad. Desliza a la izquierda si es una estafa y a la derecha si es de verdad.",
    tipos: { sms: "SMS", email: "Correo", web: "Web" },
    mensajeDe: (n: string, total: string) => `Mensaje ${n} de ${total}`,
    aciertos: (n: string) => `Aciertos: ${n}`,
    tarjeta: "tarjeta",
    etiquetaTarjeta: (n: string, tipo: string) => `Mensaje ${n}: ${tipo}`,
    estafa: "Estafa",
    deVerdad: "De verdad",
    desliza: "Desliza la tarjeta",
    // Solo con teclado; las flechas se pintan como teclas.
    flechas: (izquierda: string, derecha: string) =>
      ` o usa las flechas ${izquierda} y ${derecha} del teclado`,
    bienVisto: "¡Bien visto!",
    estaNo: "Esta no",
    esEstafa: "Es una estafa real que ha avisado INCIBE.",
    esDeVerdad: "Es un aviso de verdad. Aun así, no te fíes del mensaje: entra tú en la web oficial.",
    lasPistas: "Las pistas",
    webOficialEs: "La web oficial es",
    fuente: "Fuente:",
    webOficial: "Web oficial",
    siguiente: "Siguiente mensaje",
    verResultado: "Ver mi resultado",
    resultado: (aciertos: string, total: string) => `Has acertado ${aciertos} de ${total}`,
    valoracion: {
      perfecto: "¡Perfecto! Ninguna estafa te ha colado.",
      muyBien: "Muy bien. Repasa las que has fallado: son las que más engañan.",
      noEstaMal: "No está mal, pero alguna estafa te habría colado.",
      repasa: "Las estafas están muy bien hechas. Repasa las pistas y vuelve a probar.",
    },
    recuerda:
      "Recuerda: aunque un aviso sea de verdad, entra tú en la web oficial escribiendo la dirección. Un mensaje no prueba quién lo envía.",
    tusRespuestas: "Tus respuestas",
    acertada: "Acertada: ",
    fallada: "Fallada: ",
    respuestaEstafa: "estafa",
    respuestaDeVerdad: "de verdad",
    otraVez: "Jugar otra vez",
    comprobarReal: "Comprobar un mensaje real",
    // Texto y tres pistas de cada caso de datos/mensajes-ejemplo.json; en
    // castellano salen del fichero. Las faltas de los fraudes («411,00¿»,
    // «sanitària», «Ultimo») son pistas: los otros idiomas las conservan.
    casos: {
      F01: caso("F01"),
      F02: caso("F02"),
      F03: caso("F03"),
      F04: caso("F04"),
      F05: caso("F05"),
      L01: caso("L01"),
      L02: caso("L02"),
      L03: caso("L03"),
      L04: caso("L04"),
      L05: caso("L05"),
    },
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
