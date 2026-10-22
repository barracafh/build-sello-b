import { deEntidad } from "@/lib/veredicto";
import type { ContextoTitular, Diccionario } from "./es";

// «da DGT», «do SEPE», «de Correos»: as contraccións galegas sobre o artigo
// que deduce o castelán.
const daEntidade = (entidade: string) =>
  (deEntidad(entidade) ?? `de ${entidade}`).replace(/^de la /, "da ").replace(/^del /, "do ");

const MESES = ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"];

// Texto dos sinais fixos (src/lib/senales.ts), por código.
const TEXTOS_SINAIS: Record<string, string> = {
  enlace_no_listado: "A ligazón non é de ningunha web oficial que coñezamos.",
  enlace_acortado: "A ligazón está acurtada e agocha a onde leva.",
  enlace_parecido: "A ligazón aseméllase ao nome dun organismo oficial.",
  enlace_imita_oficial: "A ligazón imita o nome dun organismo oficial.",
  amenaza: "Ameaza con consecuencias graves, como embargos ou detencións.",
  urgencia: "Mete présa cun prazo curto ou un «último aviso».",
  ortografia: "Ten faltas ou símbolos raros, algo pouco habitual nun organismo oficial.",
  remitente_falso: "O remitente usa o nome dun servizo oficial con outro enderezo.",
  pide_dinero: "Pide diñeiro ou o pagamento dunha multa ou taxa.",
  pide_datos: "Pide datos de tarxeta, claves, IBAN ou datos persoais.",
  instruccion_qr: "Pide escanear un código QR.",
  instruccion_rara: "Pide responder, descargar algo ou chamar a un número que non é oficial.",
};

// Tradución automática: debe revisala unha persoa nativa.
export const gl = {
  saltarContenido: "Ir ao contido",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    datosReales: "Datos públicos",
    datosSimulados: "Datos simulados",
  },
  pagina: {
    antetitulo: "Verificador de mensaxes",
    titulo: "Esta mensaxe é de verdade?",
    intro:
      "Pega un SMS, un correo ou unha web que di ser da DGT, de Facenda ou doutro organismo e dicímosche se podemos confirmalo.",
  },
  pie: {
    descripcion: (nombre: string) =>
      `${nombre} é unha ferramenta independente para axudarche a identificar posibles fraudes.`,
    aviso: "Ferramenta experimental. Non é un servizo oficial.",
    organismos: "Organismos oficiais",
    ayuda: "Información e axuda",
    llamar017: "Chamar ao 017",
    linea017: "Liña 017 de INCIBE",
    avisosIncibe: "Avisos de INCIBE",
    sobre: "Sobre a ferramenta",
    privacidad: "Non gardamos o que pegas nin abrimos as súas ligazóns.",
    squad: "Equipo",
  },
  botonAviso: "Algo está mal? Avísanos",
  veredictos: {
    no_oficial: {
      etiqueta: "Non é oficial",
      titular: ({ entidad, hayEnlace }: ContextoTitular) => {
        const que = hayEnlace ? "Esta ligazón" : "Esta mensaxe";
        return entidad ? `${que} non é ${daEntidade(entidad)}` : `${que} non é oficial`;
      },
      entradilla: "Non premas nas súas ligazóns e non respondas á mensaxe.",
      pasos: [
        "Non premas na ligazón nin respondas á mensaxe.",
        "Se queres comprobar algo, entra ti na web oficial escribindo o enderezo.",
        "Se xa premiches ou deches datos, chama de balde ao 017.",
      ],
    },
    no_determinable: {
      etiqueta: "Non podemos confirmalo",
      titular: ({ entidad }: ContextoTitular) =>
        entidad ? `Non podemos confirmar que sexa ${daEntidade(entidad)}` : "Non podemos saber quen a envía",
      entradilla: "Que o texto pareza oficial non proba quen o envía.",
      pasos: [
        "Non premas na ligazón nin respondas á mensaxe.",
        "Entra ti na web oficial escribindo o enderezo.",
        "Se tes dúbidas, chama de balde ao 017.",
      ],
    },
    oficial_verificado: {
      etiqueta: "Web oficial",
      titular: ({ entidad }: ContextoTitular) =>
        entidad ? `Esta web é ${daEntidade(entidad)}` : "Esta web está na nosa lista de webs oficiais",
      entradilla:
        "Só comprobamos o enderezo, non o que che pidan dentro. Para volver entrar, escribe ti o enderezo.",
      pasos: [
        "Aínda así, non deas datos se non o esperabas.",
        "Se tes dúbidas, entra ti escribindo o enderezo da web oficial.",
        "Se xa deches datos, chama de balde ao 017 de INCIBE.",
      ],
    },
  },
  analizar: {
    etiquetaCampo: "Pega aquí a mensaxe que che chegou",
    ayudaCampo:
      "Pode ser un SMS, un correo ou a ligazón dunha web. Inclúe o remitente e a ligazón tal e como aparecen.",
    noPulses: "Non premas na ligazón.",
    placeholder: "DGT: Dispón de 24 horas para pagar a súa multa. Consulte na seguinte ligazón: hxxps://…",
    contador: (actual: string, maximo: string) => `${actual} de ${maximo} caracteres como máximo`,
    subirCaptura: "Subir unha captura",
    leyendoImagen: "Lendo a imaxe…",
    ayudaImagen: "PNG, JPG ou WebP de ata 4 MB. Sacamos o texto para que o revises.",
    comprobar: "Comprobar a mensaxe",
    comprobando: "Comprobando…",
    privacidad: "Non gardamos o que pegas nin as imaxes, nin abrimos as súas ligazóns.",
    ejemplos: "Queres probar cun exemplo?",
    deberiaDar: "Debería dar: ",
    fraude: "Fraude",
    legitimo: "Lexítimo",
    porQue: "Por que o dicimos",
    sinCifrado: "Iso si, a ligazón non está cifrada (http).",
    suplanta: "Tenta facerse pasar por:",
    senalesEncontradas: "Sinais atopados",
    senalRoja: "Sinal vermello",
    senalNaranja: "Sinal laranxa",
    otraSenal: "Outro sinal",
    remitente: "Remitente da mensaxe",
    direccionCitada: "Enderezo citado",
    direccion: "Enderezo da mensaxe",
    noLaAbras: "(non o abras):",
    webOficialEs: (entidad: string | null) =>
      entidad ? `A web oficial ${daEntidade(entidad)} é` : "A web oficial é",
    irWebOficial: "Ir á web oficial",
    desmentidos: "Xa o desmentiron",
    desmentidosTexto: "Verificadores de noticias publicaron sobre mensaxes parecidas a esta.",
    desmentidosNoPrueba: "Iso non proba por si só que esta sexa falsa.",
    queHacer: "Que facer agora",
    dudas017: "Tes dúbidas ou xa deches datos?",
    linea017: "Liña 017 de INCIBE, gratuíta e confidencial",
    horario017: "De 8:00 a 23:00, os 365 días do ano.",
    llamar017: "Chamar ao 017",
    fuentesYDatos: "Fontes e datos da comprobación",
    reputacion: "Reputación da ligazón:",
    noConsultada: "non consultada",
    registro: "Rexistro do dominio:",
    noDisponible: "non dispoñible",
    copiarEnlace: "Copiar a ligazón a este resultado",
    otroMensaje: "Comprobar outra mensaxe",
    avisoEnlace:
      "A mensaxe vai dentro da ligazón e non chega ao noso servidor, pero quen teña a ligazón poderá lela. Non a compartas se leva datos persoais.",
    enlaceCopiado: "Ligazón copiada. Quen a abra verá esta mensaxe e o seu resultado.",
    enlaceNoCopiado:
      "Non puidemos copiala. A ligazón xa está na barra de enderezos: cópiaa desde aí.",
    criterios: (apartados: string) => `Criterios de Sello (contexto.md${apartados})`,
    avisosIncibe: "INCIBE · Avisos á cidadanía",
    sinClasificadorOficial:
      "O enderezo está na nosa lista de webs oficiais. Agora mesmo non puidemos analizar o resto do texto.",
    sinClasificador:
      "Agora mesmo non puidemos analizar o texto da mensaxe, así que non podemos confirmar nada. Os sinais que ves saen de regras fixas.",
    webCitadaDe: (entidad: string) =>
      `A mensaxe cita un enderezo que si é a web oficial ${daEntidade(entidad)}. Iso non proba quen a envía: entra ti tecleando o enderezo.`,
  },
  errores: {
    vacio: "Escribe ou pega unha mensaxe antes de comprobar.",
    largo: (actual: string, maximo: string) =>
      `A mensaxe é demasiado longa: ten ${actual} caracteres e o máximo é ${maximo}.`,
    red: "Non puidemos comprobalo. Téntao de novo.",
    imagenSinTexto: "Non atopamos texto na imaxe. Copia a mensaxe e pégaa.",
    imagen: {
      ia: "Non puidemos ler a imaxe. Copia o texto da mensaxe e pégao.",
      elegir: "Escolle unha imaxe para lela.",
      vacia: "A imaxe está baleira.",
      grande: "A imaxe ocupa máis de 4 MB.",
      tipo: "A imaxe ten que ser PNG, JPG ou WebP.",
    },
  },
  motivos: {
    contenido_sospechoso:
      "A web da ligazón figura como oficial, pero a mensaxe ten sinais de fraude: non podemos confirmalo.",
    contenido_fraudulento:
      "A mensaxe usa o nome dun organismo oficial e ten sinais claros de fraude.",
    sin_enlace: "Non atopamos ningunha ligazón na mensaxe.",
    web_oficial_citada:
      "A mensaxe cita un enderezo que si é unha web oficial. Iso non proba quen a envía: entra ti tecleando o enderezo.",
    url_no_valida: "A ligazón non ten un formato que poidamos ler.",
    ip_como_host:
      "A ligazón leva a un número en vez de a un nome de web, algo que as webs oficiais non fan.",
    credenciales_en_url:
      "A ligazón agocha a web real detrás dunha @: o que parece o nome é só un disfrace.",
    acortador_no_resuelto: "É unha ligazón acurtada e non a abrimos, así que non sabemos a onde leva.",
    inquilino_no_listado:
      "Está nunha plataforma que usan moitos concellos, pero non é unha web que coñezamos.",
    gob_es_no_listado:
      "Remata en gob.es, reservado ás administracións, pero non sabemos de que organismo é.",
    marca_como_subdominio: "Usa o nome dunha web oficial ao principio, pero a web real é outra.",
    imitacion_de_marca: "Imita o nome dun organismo oficial e ten outros sinais de fraude.",
    posible_imitacion_de_marca:
      "Aseméllase ao nome dun organismo oficial, pero non podemos asegurar que sexa falsa.",
    dominio_desconocido: "Non é unha web que teñamos na nosa lista de webs oficiais.",
    homografo: "O nome usa letras doutro alfabeto para parecerse a unha web oficial.",
    indicador_publicado: "Un organismo oficial avisou de que este enderezo é unha fraude.",
    remitente_dominio_ajeno:
      "O remitente usa o nome dun organismo oficial cun enderezo de correo que non é o seu.",
    en_allowlist: "O enderezo está na nosa lista de webs oficiais.",
  },
  senales: {
    titulos: {
      pide_dinero: "Pide diñeiro",
      pide_datos: "Pide datos persoais ou bancarios",
      amenaza: "Ameaza con consecuencias graves",
      urgencia: "Mete présa",
      ortografia: "Faltas ou símbolos raros",
      remitente_falso: "Remitente que non cadra",
      enlace_sospechoso: "Ligazón sospeitosa",
      enlace_no_listado: "Ligazón que non coñecemos",
      enlace_acortado: "Ligazón acurtada",
      enlace_parecido: "Ligazón parecida a unha oficial",
      enlace_imita_oficial: "Ligazón que imita unha oficial",
      instruccion_qr: "Pide escanear un código QR",
      instruccion_rara: "Pide responder, descargar ou chamar",
      devolucion_con_enlace: "Devolución con ligazón para cobrar",
      aviso_informativo: "Parece un aviso informativo",
    },
    texto: (senal: { codigo: string; texto: string }) => TEXTOS_SINAIS[senal.codigo] ?? senal.texto,
  },
  ejemplos: {
    F01: "Devolución de Facenda (SMS)",
    F02: "Multa da DGT (SMS)",
    F03: "Paquete de Correos (SMS)",
    F04: "Tarxeta da Seguridad Social (SMS)",
    F05: "Recarga dunha multa (correo)",
    L01: "Notificación de Facenda (SMS)",
    L02: "Dirección Electrónica Vial (correo)",
    L03: "Seguimento dun envío (correo)",
    L04: "Aviso de DEHú (correo)",
    L05: "Cita no centro de saúde (web)",
  },
  compartir: {
    titulo: "Mándallo á túa familia",
    explicacion:
      "Vai a mensaxe que comprobaches, coas súas ligazóns desactivadas, e o resultado. Quita antes o que sexa persoal.",
    etiqueta: "Isto é o que se envía. Podes cambialo:",
    whatsapp: "Enviar por WhatsApp",
    otraVentana: " (ábrese noutra xanela)",
    otraApp: "Outra app",
    copiar: "Copiar o texto",
    copiado: "Texto copiado. Pégao no chat da túa familia.",
    noCopiado: "Non puidemos copialo. Selecciona o texto da caixa e cópiao.",
    meHaLlegado: "Chegoume esta mensaxe:",
    pie: (nombre: string, url: string) =>
      `Comprobeino con ${nombre}, unha ferramenta experimental que non é un servizo oficial: ${url}`,
    ayuda017: "Se tes dúbidas ou xa deches datos, chama de balde ao 017 de INCIBE.",
    laWeb: (entidad: string | null, direccion: string) =>
      `A web oficial${entidad ? ` ${daEntidade(entidad)}` : ""} é ${direccion}`,
    noOficial: (entidad: string | null) =>
      `Comprobei ${entidad ? `unha mensaxe que di ser ${daEntidade(entidad)}` : "unha mensaxe"}: NON é oficial.`,
    noPulsesUrl: (url: string) => `Non premas na ligazón nin respondas: ${url}`,
    noRespondasRemitente: (remitente: string) => `Non respondas a este remitente: ${remitente}`,
    noPulses: "Non premas nas súas ligazóns nin respondas.",
    entraTu: "Se tes que facer algo, entra ti escribindo o enderezo.",
    oficial: (entidad: string | null, url: string | null) =>
      `Comprobei unha web e está na lista de webs oficiais${entidad ? ` ${daEntidade(entidad)}` : ""}${url ? `: ${url}` : "."}`,
    noDesDatos: "Aínda así, non deas datos se non o esperabas.",
    dudaEntidad: (entidad: string) =>
      `Comprobei unha mensaxe que di ser ${daEntidade(entidad)} e non se pode confirmar que o sexa.`,
    duda: "Comprobei unha mensaxe e non se pode saber quen a envía.",
    citaOficial: "A mensaxe cita a web oficial, pero iso non proba quen a envía.",
    mejorNoPulses: (url: string) => `Mellor non premas na ligazón: ${url}`,
    mejorNoRespondas: "Mellor non respondas nin premas nada.",
    entraTuCorto: "Entra ti escribindo o enderezo.",
  },
  mes: (mes: number, año: number) => `${MESES[mes]} de ${año}`,
  fuentes: {
    aria: "Fontes",
    oficiales: "Fontes oficiais",
    verificadores: "Verificadores",
  },
} satisfies Diccionario;
