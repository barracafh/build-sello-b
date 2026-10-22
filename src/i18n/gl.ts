import { deEntidad } from "@/lib/veredicto";
import { REMITENTE_CORREOS, type ContextoTitular, type Diccionario } from "./es";

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
    frase: "Compróbao antes de fiarte.",
    secciones: "Seccións",
    datosReales: "Datos públicos",
    datosSimulados: "Datos simulados",
    menu: {
      verificar: { nombre: "Comprobar unha mensaxe", corto: "Comprobar" },
      juego: { nombre: "Xogo: estafa ou non?", corto: "Estafa ou non?" },
    },
  },
  pagina: {
    titulo: "Esta mensaxe é de verdade?",
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
    campo: {
      antes: "Pega aquí o SMS, o correo ou a web tal e como che chegou, ",
      negrita: "sen premer en ningunha ligazón",
      despues: ", e dicímosche se podemos confirmalo.",
    },
    placeholder: "DGT: Dispón de 24 horas para pagar a súa multa. Consulte na seguinte ligazón: hxxps://…",
    contador: (actual: string, maximo: string) => `${actual} de ${maximo} caracteres como máximo`,
    subirCaptura: "Subir captura",
    leyendoImagen: "Lendo a imaxe…",
    ayudaImagen: "Captura en PNG, JPG ou WebP, ata 4 MB.",
    comprobar: "Comprobar mensaxe",
    comprobarCorto: "Comprobar",
    leyendoCorto: "Lendo…",
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
    motivoSuplantacion: "A mensaxe ten sinais claros de suplantación.",
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
    url_no_valida:
      "A ligazón está incompleta ou rota: non a premas; escribe ti o enderezo do organismo.",
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
    whatsapp: "Enviar por WhatsApp",
    otraVentana: " (ábrese noutra xanela)",
    otraApp: "Outra app",
    copiar: "Copiar o texto",
    copiado: "Texto copiado. Pégao no chat da túa familia.",
    noCopiado: "Non puidemos copialo. Proba con «Enviar por WhatsApp».",
    pie: (nombre: string, url: string) =>
      `Comprobeino con ${nombre}: ${url}`,
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
  emergencia: {
    seccion: "Se xa actuaches",
    yaHasActuado: "Xa actuaches?",
    cuentanos: "Cóntanos que pasou e dicímosche que facer agora.",
    yaHePulsado: "Xa premín →",
    queHiciste: "Que fixeches?",
    marca: "Marca todo o que corresponda.",
    pasosDebajo: "Os pasos aparecen debaixo.",
    pasosDerecha: "Os pasos aparecen á dereita.",
    cerrar: "Pechar",
    accionesAria: "Accións feitas",
    anuncio: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"} para o teu caso.`,
    vacio: "Aquí verás que facer, en orde.",
    marcaArriba: "Marca arriba o que fixeches.",
    marcaIzquierda: "Marca á esquerda o que fixeches.",
    queHacerAhora: "Que facer agora",
    cuantosPasos: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    grupos: { primero: "Primeiro, agora mesmo", despues: "Despois", queHacer: "Que facer" },
    verPasos: (n: number) => `Ver os teus ${n} ${n === 1 ? "paso" : "pasos"}`,
    // Fuentes del modo emergencia: «INCIBE» y «017» los pone el componente.
    fuentes: { linea: "Liña de axuda en ciberseguridade", reporte: "Denuncia de fraude" },
    acciones: {
      enlace: { label: "Premín a ligazón", descripcion: "Abrín a web, pero non introducín nada" },
      tarjeta: { label: "Metín os datos da tarxeta ou do banco", descripcion: "Número de tarxeta, CVV, conta…" },
      clave: { label: "Dei o meu contrasinal de Cl@ve ou os datos de acceso", descripcion: "Usuario, contrasinal ou código recibido" },
      instale: { label: "Instalei algo ou descarguei un ficheiro", descripcion: "Unha app, un anexo…" },
      pague: { label: "Paguei", descripcion: "Fixen unha transferencia ou un cargo" },
    },
    pasos: {
      banco: "Chama agora ao teu banco e dilles que bloqueen a tarxeta ou a conta. O teléfono está no reverso da tarxeta.",
      "banco-pago": "Chama ao teu banco, explícalles o que pasou e pregunta se che poden devolver o diñeiro.",
      capturas: "Fai unha foto co móbil á mensaxe que recibiches, para tela gardada por se fai falta despois.",
      "cambiar-clave": "Cambia o teu contrasinal de Cl@ve canto antes. Escribe ti mesmo o enderezo no navegador, non premas ningunha ligazón.",
      "revisar-dehu": "Entra na túa caixa de notificacións e na túa Carpeta Cidadá escribindo ti mesmo o enderezo, e mira se hai algo raro.",
      "no-dispositivo": "Non uses ese teléfono ou ordenador para entrar no banco nin para poñer contrasinais ata que alguén de confianza o revise.",
      "no-enlace": "Non volvas premer esa ligazón nin chames ao número que aparecía na mensaxe.",
      denuncia: "Pon unha denuncia na Policía Nacional ou na Garda Civil. Podes facelo por internet ou indo en persoa.",
      "017": "Chama ao 017, é gratis. Atenden todos os días de 8 da mañá a 11 da noite e explícanche exactamente que facer.",
      "reporte-incibe": "Avisa o organismo oficial de ciberseguridade (INCIBE) do que pasou.",
    },
  },
  senalado: {
    titulo: "Así se ve na túa mensaxe",
    continuo: "Subliñado continuo",
    trazos: "Subliñado a trazos",
    roja: "sinal vermello",
    naranja: "sinal laranxa",
  },
  carga: {
    pasos: ["Revisando a ligazón…", "Buscando sinais de estafa…", "Consultando fontes oficiais…"],
    lenta: "Isto pode tardar uns segundos máis.",
  },
  juego: {
    antetitulo: "Xogo · 10 mensaxes",
    titulo: "Estafa ou non?",
    intro:
      "Cinco estafas reais avisadas polo INCIBE e cinco avisos de verdade. Esvara á esquerda se é unha estafa e á dereita se é de verdade.",
    tipos: { sms: "SMS", email: "Correo", web: "Web" },
    mensajeDe: (n: string, total: string) => `Mensaxe ${n} de ${total}`,
    aciertos: (n: string) => `Acertos: ${n}`,
    tarjeta: "tarxeta",
    etiquetaTarjeta: (n: string, tipo: string) => `Mensaxe ${n}: ${tipo}`,
    estafa: "Estafa",
    deVerdad: "De verdade",
    desliza: "Esvara a tarxeta",
    flechas: (izquierda: string, derecha: string) =>
      ` ou usa as frechas ${izquierda} e ${derecha} do teclado`,
    bienVisto: "Ben visto!",
    estaNo: "Esta non",
    esEstafa: "É unha estafa real que avisou o INCIBE.",
    esDeVerdad: "É un aviso de verdade. Aínda así, non te fíes da mensaxe: entra ti na web oficial.",
    lasPistas: "As pistas",
    webOficialEs: "A web oficial é",
    fuente: "Fonte:",
    webOficial: "Web oficial",
    siguiente: "Seguinte mensaxe",
    verResultado: "Ver o meu resultado",
    resultado: (aciertos: string, total: string) => `Acertaches ${aciertos} de ${total}`,
    valoracion: {
      perfecto: "Perfecto! Ningunha estafa te enganou.",
      muyBien: "Moi ben. Repasa as que fallaches: son as que máis enganan.",
      noEstaMal: "Non está mal, pero algunha estafa teríate enganado.",
      repasa: "As estafas están moi ben feitas. Repasa as pistas e volve probar.",
    },
    recuerda:
      "Lembra: aínda que un aviso sexa de verdade, entra ti na web oficial escribindo o enderezo. Unha mensaxe non proba quen a envía.",
    tusRespuestas: "As túas respostas",
    acertada: "Acertada: ",
    fallada: "Fallada: ",
    respuestaEstafa: "estafa",
    respuestaDeVerdad: "de verdade",
    otraVez: "Xogar outra vez",
    comprobarReal: "Comprobar unha mensaxe real",
    casos: {
      F01: {
        texto:
          "AXENCIA TRIBUTARIA: Ordenouse o pagamento 411,00¿ da súa devolucion do IRPF da renda 2023. mais informacion na web:",
        pistas: [
          "Promete unha devolución de diñeiro e pide premer unha ligazón",
          "A ligazón non leva a sede.agenciatributaria.gob.es",
          "A web falsa pide nome completo, número de tarxeta, data de caducidade, CVV e PIN; a AEAT nunca pide datos de tarxeta por SMS",
        ],
      },
      F02: {
        texto:
          "DGT: Dispón de 24 horas restantes para pagar a súa multa do 13/06/2024. Consulte na seguinte ligazón:",
        pistas: [
          "Mete présa cun prazo de 24 horas para evitar un recargo",
          "A DGT notifica as multas por carta certificada ou pola DEV (Dirección Electrónica Vial), non con ligazóns de pagamento nun SMS",
          "O alias 'DGT' do remitente pódese falsificar",
        ],
      },
      F03: {
        texto:
          "[CORREOS] Estimado cliente: O seu paquete non se puido entregar o dd/mm porque non se pagaron as taxas de aduana X,XX€: Siga as instrucións: [URL fraudulenta]",
        pistas: [
          "Pide pagar unha pequena cantidade (taxas de aduana) mediante unha ligazón",
          "Correos nunca pide datos bancarios nin pagamentos por SMS ou correo",
          "Usa o nome da empresa dentro dun dominio que non é correos.es",
        ],
      },
      F04: {
        texto:
          "SEGURIDADE SOCIAL: A súa tarxeta sanitària require unha actualización. Por favor actualíceo a través do sitio seguro para manter os seus servizos: [URL maliciosa]",
        pistas: [
          "Pide 'actualizar' datos mediante unha ligazón e ameaza con perder servizos",
          "A Seguridade Social non pide actualizar datos nin pagar débedas mediante ligazóns en SMS (INCIBE, aviso do 19/08/2026)",
          "Erro ortográfico ('sanitària', con acento catalán) e concordancia incorrecta ('actualíceo')",
        ],
      },
      F05: {
        texto:
          "Asunto: Ultimo recordatorio antes do recargo da súa multa – Expediente n,º XXXXXXX",
        pistas: [
          "'A DGT NUNCA notifica as súas multas por correo electrónico' (dgt.es)",
          "Ameaza cun recargo para meter présa",
          "O remitente non é do dominio oficial da DGT",
        ],
      },
      L01: {
        texto:
          "AEAT: Ten unha nova notificación dispoñible. Pode consultala accedendo polos seus propios medios á Sede electrónica da Axencia Tributaria (sede.agenciatributaria.gob.es) ou á DEHú. Esta mensaxe é só informativa.",
        pistas: [
          "O texto encaixa cun aviso oficial, pero non proba quen o envía: o remitente pódese falsificar. Por iso non se confirma; remítese á sede tecleando o enderezo",
          "Só avisa de que hai unha notificación; non pide datos, pagamentos nin tarxeta",
          "Non inclúe unha ligazón para premer: remite á sede oficial .gob.es",
        ],
      },
      L02: {
        texto:
          "Asunto: Dirección Electrónica Vial – Ten unha nova notificación. Informámolo de que ten unha nova notificación na súa Dirección Electrónica Vial (DEV). Para consultala, acceda á Sede electrónica da DGT (sede.dgt.gob.es) e identifíquese con DNI electrónico, certificado dixital ou Cl@ve.",
        pistas: [
          "O texto encaixa cun aviso oficial, pero non proba quen o envía: o remitente pódese falsificar. Por iso non se confirma; remítese á sede tecleando o enderezo",
          "Só o recibe quen se deu de alta voluntariamente na DEV",
          "Non contén importes, prazos de 24 horas nin ligazóns de pagamento",
        ],
      },
      L03: {
        texto:
          `De: ${REMITENTE_CORREOS}. Asunto: O teu envío está en camiño. Ola, o teu envío con referencia PQ00000000000000000000 está en reparto. Podes seguilo no Localizador de Envíos de www.correos.es ou na app de Correos. Código seguro: XXXX-XXXX (recadro amarelo ao final da mensaxe).`,
        pistas: [
          "O texto encaixa cun aviso oficial, pero non proba quen o envía: o remitente pódese falsificar. Por iso non se confirma; remítese á sede tecleando o enderezo",
          `O remitente é ${REMITENTE_CORREOS}, o que Correos indica para as súas comunicacións oficiais, aínda que un remitente se pode falsificar`,
          "Inclúe un código seguro que se pode comprobar no verificador de correo de correos.es",
        ],
      },
      L04: {
        texto:
          "Asunto: DEHú – Aviso de nova notificación. Informámolo de que ten á súa disposición unha nova notificación da Axencia Estatal de Administración Tributaria na Dirección Electrónica Habilitada única. Pode acceder a ela en dehu.redsara.es identificándose con Cl@ve, certificado ou DNIe. Este é un aviso de cortesía.",
        pistas: [
          "O texto encaixa cun aviso oficial, pero non proba quen o envía: o remitente pódese falsificar. Por iso non se confirma; remítese á sede tecleando o enderezo",
          "A DEHú envía 'avisos de cortesía' por correo cando chega unha nova notificación dun organismo adherido",
          "Remite ao dominio oficial dehu.redsara.es, que non é .gob.es pero si é oficial",
        ],
      },
      L05: {
        texto:
          "Páxina 'Axuda Solicitude de Cita en Atención Primaria – Portal do Paciente – Conselleria de Sanidad'. Para pedir cita co teu médico ou enfermaría de atención primaria, introduce o teu número SIP e a túa data de nacemento e escolle día e hora.",
        pistas: [
          "O URL está na lista de dominios oficiais (san.gva.es) e non leva parámetros de redirección",
          "Dominio san.gva.es, subdominio oficial da Generalitat Valenciana",
          "Pide SIP e data de nacemento, pero nunca datos bancarios nin de tarxeta",
        ],
      },
    },
  },
  fuentes: {
    aria: "Fontes",
    oficiales: "Fontes oficiais",
    verificadores: "Verificadores",
  },
} satisfies Diccionario;
