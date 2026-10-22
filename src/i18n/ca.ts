import { deEntidad } from "@/lib/veredicto";
import { REMITENTE_CORREOS, type ContextoTitular, type Diccionario } from "./es";

// «de la DGT», «del SEPE», «de Correos» com en castellà, però amb apòstrof
// davant de vocal: «de l'Agencia Tributaria», «de l'INCIBE».
export const deEntitat = (entitat: string) =>
  (deEntidad(entitat) ?? `de ${entitat}`).replace(/^(?:de la|del) (?=[AEIOUÁÉÍÓÚaeiouáéíóú])/, "de l'");

const MESOS = ["de gener", "de febrer", "de març", "d'abril", "de maig", "de juny", "de juliol", "d'agost", "de setembre", "d'octubre", "de novembre", "de desembre"];

// Text dels senyals fixos (src/lib/senales.ts), per codi.
const TEXTOS_SENALES: Record<string, string> = {
  enlace_no_listado: "L'enllaç no és de cap web oficial que coneguem.",
  enlace_acortado: "L'enllaç està escurçat i amaga on porta.",
  enlace_parecido: "L'enllaç s'assembla al nom d'un organisme oficial.",
  enlace_imita_oficial: "L'enllaç imita el nom d'un organisme oficial.",
  amenaza: "Amenaça amb conseqüències greus, com embargaments o detencions.",
  urgencia: "Fa pressa amb un termini curt o un «últim avís».",
  ortografia: "Té faltes o símbols estranys, cosa poc habitual en un organisme oficial.",
  remitente_falso: "El remitent fa servir el nom d'un servei oficial amb una altra adreça.",
  pide_dinero: "Demana diners o el pagament d'una multa o taxa.",
  pide_datos: "Demana dades de targeta, claus, IBAN o dades personals.",
  instruccion_qr: "Demana escanejar un codi QR.",
  instruccion_rara: "Demana respondre, descarregar alguna cosa o trucar a un número que no és oficial.",
};

// Traducció automàtica: l'ha de revisar una persona nativa.
export const ca = {
  saltarContenido: "Salta al contingut",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    frase: "Comprova-ho abans de confiar-hi.",
    secciones: "Seccions",
    datosReales: "Dades públiques",
    datosSimulados: "Dades simulades",
    menu: {
      verificar: { nombre: "Comprova un missatge", corto: "Comprova" },
      juego: { nombre: "Joc: estafa o no?", corto: "Estafa o no?" },
    },
  },
  pagina: {
    titulo: "Aquest missatge és de veritat?",
  },
  pie: {
    descripcion: (nombre: string) =>
      `${nombre} és una eina independent per ajudar-te a identificar possibles fraus.`,
    aviso: "Eina experimental. No és un servei oficial.",
    organismos: "Organismes oficials",
    ayuda: "Informació i ajuda",
    llamar017: "Truca al 017",
    linea017: "Línia 017 d'INCIBE",
    avisosIncibe: "Avisos d'INCIBE",
    sobre: "Sobre l'eina",
    privacidad: "No guardem el que enganxes ni obrim els seus enllaços.",
    squad: "Equip",
  },
  botonAviso: "Hi ha alguna cosa malament? Avisa'ns",
  veredictos: {
    no_oficial: {
      etiqueta: "No és oficial",
      titular: ({ entidad, hayEnlace }: ContextoTitular) => {
        const que = hayEnlace ? "Aquest enllaç" : "Aquest missatge";
        return entidad ? `${que} no és ${deEntitat(entidad)}` : `${que} no és oficial`;
      },
      entradilla: "No toquis els seus enllaços i no responguis el missatge.",
      pasos: [
        "No toquis l'enllaç ni responguis el missatge.",
        "Si vols comprovar alguna cosa, entra tu al web oficial escrivint l'adreça.",
        "Si ja l'has tocat o has donat dades, truca gratis al 017.",
      ],
    },
    no_determinable: {
      etiqueta: "No ho podem confirmar",
      titular: ({ entidad }: ContextoTitular) =>
        entidad
          ? `No podem confirmar que sigui ${deEntitat(entidad)}`
          : "No podem saber qui l'envia",
      entradilla: "Que el text sembli oficial no demostra qui l'envia.",
      pasos: [
        "No toquis l'enllaç ni responguis el missatge.",
        "Entra tu al web oficial escrivint l'adreça.",
        "Si dubtes, truca gratis al 017.",
      ],
    },
    oficial_verificado: {
      etiqueta: "Web oficial",
      titular: ({ entidad }: ContextoTitular) =>
        entidad ? `Aquest web és ${deEntitat(entidad)}` : "Aquest web és a la nostra llista de webs oficials",
      entradilla:
        "Només comprovem l'adreça, no el que et demanin a dins. Per tornar-hi a entrar, escriu tu l'adreça.",
      pasos: [
        "Tot i així, no donis dades si no t'ho esperaves.",
        "Si dubtes, entra tu escrivint l'adreça del web oficial.",
        "Si ja has donat dades, truca gratis al 017 d'INCIBE.",
      ],
    },
  },
  analizar: {
    campo: {
      antes: "Enganxa aquí l'SMS, el correu o la web tal com t'ha arribat, ",
      negrita: "sense tocar cap enllaç",
      despues: ", i et direm si ho podem confirmar.",
    },
    placeholder: "DGT: Disposa de 24 hores per pagar la multa. Consulti l'enllaç següent: hxxps://…",
    contador: (actual: string, maximo: string) => `${actual} de ${maximo} caràcters com a màxim`,
    subirCaptura: "Puja captura",
    leyendoImagen: "S'està llegint la imatge…",
    ayudaImagen: "Captura en PNG, JPG o WebP, fins a 4 MB.",
    comprobar: "Comprova el missatge",
    comprobarCorto: "Comprova",
    leyendoCorto: "Llegint…",
    comprobando: "S'està comprovant…",
    privacidad: "No guardem el que enganxes ni les imatges, ni obrim els seus enllaços.",
    ejemplos: "Vols provar-ho amb un exemple?",
    deberiaDar: "Hauria de donar: ",
    fraude: "Frau",
    legitimo: "Legítim",
    porQue: "Per què ho diem",
    sinCifrado: "Això sí, l'enllaç no està xifrat (http).",
    suplanta: "Intenta fer-se passar per:",
    senalesEncontradas: "Senyals trobats",
    senalRoja: "Senyal vermell",
    senalNaranja: "Senyal taronja",
    otraSenal: "Un altre senyal",
    remitente: "Remitent del missatge",
    direccionCitada: "Adreça citada",
    direccion: "Adreça del missatge",
    noLaAbras: "(no l'obris):",
    webOficialEs: (entidad: string | null) =>
      entidad ? `El web oficial ${deEntitat(entidad)} és` : "El web oficial és",
    irWebOficial: "Ves al web oficial",
    desmentidos: "Ja ho han desmentit",
    desmentidosTexto: "Verificadors de notícies han publicat sobre missatges semblants a aquest.",
    desmentidosNoPrueba: "Això no demostra per si sol que aquest sigui fals.",
    queHacer: "Què has de fer ara",
    dudas017: "Tens dubtes o ja has donat dades?",
    linea017: "Línia 017 d'INCIBE, gratuïta i confidencial",
    horario017: "De 8.00 a 23.00, els 365 dies de l'any.",
    llamar017: "Truca al 017",
    fuentesYDatos: "Fonts i dades de la comprovació",
    reputacion: "Reputació de l'enllaç:",
    noConsultada: "no consultada",
    registro: "Registre del domini:",
    noDisponible: "no disponible",
    copiarEnlace: "Copia l'enllaç a aquest resultat",
    otroMensaje: "Comprova un altre missatge",
    avisoEnlace:
      "El missatge va dins de l'enllaç i no arriba al nostre servidor, però qui tingui l'enllaç el podrà llegir. No el comparteixis si porta dades personals.",
    enlaceCopiado: "Enllaç copiat. Qui l'obri veurà aquest missatge i el seu resultat.",
    enlaceNoCopiado:
      "No l'hem pogut copiar. L'enllaç ja és a la barra d'adreces: copia'l des d'allà.",
    criterios: (apartados: string) => `Criteris de Sello (contexto.md${apartados})`,
    avisosIncibe: "INCIBE · Avisos a la ciutadania",
    sinClasificadorOficial:
      "L'adreça és a la nostra llista de webs oficials. Ara mateix no hem pogut analitzar la resta del text.",
    sinClasificador:
      "Ara mateix no hem pogut analitzar el text del missatge, així que no podem confirmar res. Els senyals que veus surten de regles fixes.",
    motivoSuplantacion: "El missatge té senyals clars de suplantació.",
    webCitadaDe: (entidad: string) =>
      `El missatge cita una adreça que sí que és el web oficial ${deEntitat(entidad)}. Això no demostra qui l'envia: entra-hi escrivint tu l'adreça.`,
  },
  errores: {
    vacio: "Escriu o enganxa un missatge abans de comprovar-lo.",
    largo: (actual: string, maximo: string) =>
      `El missatge és massa llarg: té ${actual} caràcters i el màxim és ${maximo}.`,
    red: "No ho hem pogut comprovar. Torna-ho a provar.",
    imagenSinTexto: "No hem trobat text a la imatge. Copia el missatge i enganxa'l.",
    imagen: {
      ia: "No hem pogut llegir la imatge. Copia el text del missatge i enganxa'l.",
      elegir: "Tria una imatge per llegir-la.",
      vacia: "La imatge és buida.",
      grande: "La imatge ocupa més de 4 MB.",
      tipo: "La imatge ha de ser PNG, JPG o WebP.",
    },
  },
  motivos: {
    contenido_sospechoso:
      "El web de l'enllaç consta com a oficial, però el missatge té senyals de frau: no ho podem confirmar.",
    contenido_fraudulento:
      "El missatge fa servir el nom d'un organisme oficial i té senyals clars de frau.",
    sin_enlace: "No hem trobat cap enllaç al missatge.",
    web_oficial_citada:
      "El missatge cita una adreça que sí que és un web oficial. Això no demostra qui l'envia: entra-hi escrivint tu l'adreça.",
    url_no_valida:
      "L'enllaç està incomplet o trencat: no el premis; escriu tu l'adreça de l'organisme.",
    ip_como_host:
      "L'enllaç porta a un número en lloc d'un nom de web, cosa que els webs oficials no fan.",
    credenciales_en_url:
      "L'enllaç amaga el web real darrere d'una @: el que sembla el nom és només una disfressa.",
    acortador_no_resuelto: "És un enllaç escurçat i no l'obrim, així que no sabem on porta.",
    inquilino_no_listado:
      "És en una plataforma que fan servir molts ajuntaments, però no és un web que coneguem.",
    gob_es_no_listado:
      "Acaba en gob.es, reservat a les administracions, però no sabem de quin organisme és.",
    marca_como_subdominio: "Fa servir el nom d'un web oficial al principi, però el web real és un altre.",
    imitacion_de_marca: "Imita el nom d'un organisme oficial i té altres senyals de frau.",
    posible_imitacion_de_marca: "S'assembla al nom d'un organisme oficial, però no és el seu web. Tracta'l com un frau.",
    dominio_desconocido: "No és un web que tinguem a la nostra llista de webs oficials.",
    homografo: "El nom fa servir lletres d'un altre alfabet per semblar un web oficial.",
    indicador_publicado: "Un organisme oficial ha avisat que aquesta adreça és un frau.",
    remitente_dominio_ajeno:
      "El remitent fa servir el nom d'un organisme oficial amb una adreça de correu que no és la seva.",
    en_allowlist: "L'adreça és a la nostra llista de webs oficials.",
  },
  senales: {
    titulos: {
      pide_dinero: "Demana diners",
      pide_datos: "Demana dades personals o bancàries",
      amenaza: "Amenaça amb conseqüències greus",
      urgencia: "Fa pressa",
      ortografia: "Faltes o símbols estranys",
      remitente_falso: "Remitent que no quadra",
      enlace_sospechoso: "Enllaç sospitós",
      enlace_no_listado: "Enllaç que no coneixem",
      enlace_acortado: "Enllaç escurçat",
      enlace_parecido: "Enllaç semblant a un d'oficial",
      enlace_imita_oficial: "Enllaç que n'imita un d'oficial",
      instruccion_qr: "Demana escanejar un codi QR",
      instruccion_rara: "Demana respondre, descarregar o trucar",
      devolucion_con_enlace: "Devolució amb enllaç per cobrar",
      aviso_informativo: "Sembla un avís informatiu",
    },
    texto: (senal: { codigo: string; texto: string }) => TEXTOS_SENALES[senal.codigo] ?? senal.texto,
  },
  ejemplos: {
    F01: "Devolució d'Hisenda (SMS)",
    F02: "Multa de la DGT (SMS)",
    F03: "Paquet de Correos (SMS)",
    F04: "Targeta de la Seguridad Social (SMS)",
    F05: "Recàrrec d'una multa (correu)",
    L01: "Notificació d'Hisenda (SMS)",
    L02: "Dirección Electrónica Vial (correu)",
    L03: "Seguiment d'un enviament (correu)",
    L04: "Avís de DEHú (correu)",
    L05: "Cita al centre de salut (web)",
  },
  compartir: {
    titulo: "Envia-ho a la teva família",
    whatsapp: "Envia per WhatsApp",
    otraVentana: " (s'obre en una altra finestra)",
    otraApp: "Una altra app",
    copiar: "Copia el text",
    copiado: "Text copiat. Enganxa'l al xat de la teva família.",
    noCopiado: "No l'hem pogut copiar. Prova amb «Envia per WhatsApp».",
    pie: (nombre: string, url: string) =>
      `Ho he comprovat amb ${nombre}: ${url}`,
    ayuda017: "Si dubtes o ja has donat dades, truca gratis al 017 d'INCIBE.",
    laWeb: (entidad: string | null, direccion: string) =>
      `El web oficial${entidad ? ` ${deEntitat(entidad)}` : ""} és ${direccion}`,
    noOficial: (entidad: string | null) =>
      `He comprovat ${entidad ? `un missatge que diu ser ${deEntitat(entidad)}` : "un missatge"}: NO és oficial.`,
    noPulsesUrl: (url: string) => `No toquis l'enllaç ni responguis: ${url}`,
    noRespondasRemitente: (remitente: string) => `No responguis aquest remitent: ${remitente}`,
    noPulses: "No toquis els seus enllaços ni responguis.",
    entraTu: "Si has de fer alguna cosa, entra-hi tu escrivint l'adreça.",
    oficial: (entidad: string | null, url: string | null) =>
      `He comprovat un web i és a la llista de webs oficials${entidad ? ` ${deEntitat(entidad)}` : ""}${url ? `: ${url}` : "."}`,
    noDesDatos: "Tot i així, no donis dades si no t'ho esperaves.",
    dudaEntidad: (entidad: string) =>
      `He comprovat un missatge que diu ser ${deEntitat(entidad)} i no es pot confirmar que ho sigui.`,
    duda: "He comprovat un missatge i no es pot saber qui l'envia.",
    citaOficial: "El missatge cita el web oficial, però això no demostra qui l'envia.",
    mejorNoPulses: (url: string) => `Millor no toquis l'enllaç: ${url}`,
    mejorNoRespondas: "Millor no responguis ni toquis res.",
    entraTuCorto: "Entra-hi tu escrivint l'adreça.",
  },
  // «de març de 2025», «d'abril de 2025».
  mes: (mes: number, año: number) => `${MESOS[mes]} de ${año}`,
  emergencia: {
    seccion: "Si ja has actuat",
    yaHasActuado: "Ja has actuat?",
    cuentanos: "Explica'ns què ha passat i et direm què has de fer ara.",
    yaHePulsado: "Ja l'he tocat →",
    queHiciste: "Què vas fer?",
    marca: "Marca tot el que correspongui.",
    pasosDebajo: "Els passos apareixen a sota.",
    pasosDerecha: "Els passos apareixen a la dreta.",
    cerrar: "Tanca",
    accionesAria: "Accions fetes",
    anuncio: (n: number) => `${n} ${n === 1 ? "pas" : "passos"} per al teu cas.`,
    vacio: "Aquí veuràs què has de fer, en ordre.",
    marcaArriba: "Marca a dalt el que vas fer.",
    marcaIzquierda: "Marca a l'esquerra el que vas fer.",
    queHacerAhora: "Què has de fer ara",
    cuantosPasos: (n: number) => `${n} ${n === 1 ? "pas" : "passos"}`,
    grupos: { primero: "Primer, ara mateix", despues: "Després", queHacer: "Què has de fer" },
    verPasos: (n: number) => `Veure els teus ${n} ${n === 1 ? "pas" : "passos"}`,
    // Fuentes del modo emergencia: «INCIBE» y «017» los pone el componente.
    fuentes: { linea: "Línia d'ajuda en ciberseguretat", reporte: "Notificació de frau" },
    acciones: {
      enlace: { label: "Vaig tocar l'enllaç", descripcion: "Vaig obrir la web, però no hi vaig posar res" },
      tarjeta: { label: "Vaig posar les dades de la targeta o del banc", descripcion: "Número de targeta, CVV, compte…" },
      clave: { label: "Vaig donar la contrasenya de Cl@ve o les dades d'accés", descripcion: "Usuari, contrasenya o codi rebut" },
      instale: { label: "Vaig instal·lar alguna cosa o baixar un fitxer", descripcion: "Una app, un adjunt…" },
      pague: { label: "Vaig pagar", descripcion: "Vaig fer una transferència o un càrrec" },
    },
    pasos: {
      banco: "Truca ara al teu banc i demana que bloquegin la targeta o el compte. El telèfon és al revers de la targeta.",
      "banco-pago": "Truca al teu banc, explica què ha passat i pregunta si et poden tornar els diners.",
      capturas: "Fes una foto amb el mòbil al missatge que vas rebre, per tenir-lo guardat per si cal més endavant.",
      "cambiar-clave": "Canvia la contrasenya de Cl@ve com més aviat millor. Escriu tu mateix l'adreça al navegador, no toquis cap enllaç.",
      "revisar-dehu": "Entra a la teva bústia de notificacions i a la Carpeta Ciutadana escrivint tu mateix l'adreça, i mira si hi ha res estrany.",
      "no-dispositivo": "No facis servir aquell telèfon o ordinador per entrar al banc ni per posar contrasenyes fins que algú de confiança el revisi.",
      "no-enlace": "No tornis a tocar aquell enllaç ni truquis al número que sortia al missatge.",
      denuncia: "Posa una denúncia a la Policia Nacional o a la Guàrdia Civil. Ho pots fer per internet o anant-hi en persona.",
      "017": "Truca al 017, és gratuït. T'atenen cada dia de 8 del matí a 11 de la nit i t'expliquen exactament què has de fer.",
      "reporte-incibe": "Avisa l'organisme oficial de ciberseguretat (INCIBE) del que ha passat.",
    },
  },
  senalado: {
    titulo: "Així es veu al teu missatge",
    continuo: "Subratllat continu",
    trazos: "Subratllat a ratlles",
    roja: "senyal vermell",
    naranja: "senyal taronja",
  },
  carga: {
    pasos: ["Revisant l'enllaç…", "Buscant senyals d'estafa…", "Consultant fonts oficials…"],
    lenta: "Això pot trigar uns segons més.",
  },
  juego: {
    antetitulo: "Joc · 10 missatges",
    titulo: "Estafa o no?",
    intro:
      "Cinc estafes reals avisades per l'INCIBE i cinc avisos de veritat. Llisca cap a l'esquerra si és una estafa i cap a la dreta si és de veritat.",
    tipos: { sms: "SMS", email: "Correu", web: "Web" },
    mensajeDe: (n: string, total: string) => `Missatge ${n} de ${total}`,
    aciertos: (n: string) => `Encerts: ${n}`,
    tarjeta: "targeta",
    etiquetaTarjeta: (n: string, tipo: string) => `Missatge ${n}: ${tipo}`,
    estafa: "Estafa",
    deVerdad: "De veritat",
    desliza: "Llisca la targeta",
    flechas: (izquierda: string, derecha: string) =>
      ` o fes servir les fletxes ${izquierda} i ${derecha} del teclat`,
    bienVisto: "Ben vist!",
    estaNo: "Aquesta no",
    esEstafa: "És una estafa real que ha avisat l'INCIBE.",
    esDeVerdad: "És un avís de veritat. Tot i això, no et fiïs del missatge: entra tu a la web oficial.",
    lasPistas: "Les pistes",
    webOficialEs: "La web oficial és",
    fuente: "Font:",
    webOficial: "Web oficial",
    siguiente: "Missatge següent",
    verResultado: "Veure el meu resultat",
    resultado: (aciertos: string, total: string) => `N'has encertat ${aciertos} de ${total}`,
    valoracion: {
      perfecto: "Perfecte! No t'ha enganyat cap estafa.",
      muyBien: "Molt bé. Repassa les que has fallat: són les que enganyen més.",
      noEstaMal: "No està malament, però alguna estafa t'hauria enganyat.",
      repasa: "Les estafes estan molt ben fetes. Repassa les pistes i torna-ho a provar.",
    },
    recuerda:
      "Recorda: encara que un avís sigui de veritat, entra tu a la web oficial escrivint l'adreça. Un missatge no prova qui l'envia.",
    tusRespuestas: "Les teves respostes",
    acertada: "Encertada: ",
    fallada: "Fallada: ",
    respuestaEstafa: "estafa",
    respuestaDeVerdad: "de veritat",
    otraVez: "Torna a jugar",
    comprobarReal: "Comprova un missatge real",
    casos: {
      F01: {
        texto:
          "AGENCIA TRIBUTARIA: S'ha ordenat el pagament 411,00¿ de la seva devolucio de l'IRPF de la renda 2023. mes informacio a la web:",
        pistas: [
          "Promet una devolució de diners i demana tocar un enllaç",
          "L'enllaç no porta a sede.agenciatributaria.gob.es",
          "La web falsa demana nom complet, número de targeta, data de caducitat, CVV i PIN; l'AEAT mai no demana dades de targeta per SMS",
        ],
      },
      F02: {
        texto:
          "DGT: Disposa de 24 hores restants per pagar la seva multa del 13/06/2024. Consulti-ho a l'enllaç següent:",
        pistas: [
          "Fa pressa amb un termini de 24 hores per evitar un recàrrec",
          "La DGT notifica les multes per carta certificada o per la DEV (Dirección Electrónica Vial), no amb enllaços de pagament en un SMS",
          "L'àlies 'DGT' del remitent es pot falsificar",
        ],
      },
      F03: {
        texto:
          "[CORREOS] Benvolgut client: El seu paquet no s'ha pogut lliurar el dd/mm perquè no s'han pagat les taxes de duana X,XX€: Segueixi les instruccions: [URL fraudulenta]",
        pistas: [
          "Demana pagar una quantitat petita (taxes de duana) amb un enllaç",
          "Correos mai no demana dades bancàries ni pagaments per SMS o correu",
          "Fa servir el nom de l'empresa dins d'un domini que no és correos.es",
        ],
      },
      F04: {
        texto:
          "SEGURETAT SOCIAL: La seva targeta sanitària requereix una actualització. Si us plau actualitzi'l a través del lloc segur per mantenir els seus serveis: [URL maliciosa]",
        pistas: [
          "Demana 'actualitzar' dades amb un enllaç i amenaça amb perdre serveis",
          "La Seguretat Social no demana actualitzar dades ni pagar deutes amb enllaços en SMS (INCIBE, avís del 19/08/2026)",
          "Concordança incorrecta ('actualitzi'l', per a una targeta)",
        ],
      },
      F05: {
        texto:
          "Assumpte: Ultim recordatori abans del recàrrec de la seva multa – Expedient n,º XXXXXXX",
        pistas: [
          "'La DGT MAI no notifica les multes per correu electrònic' (dgt.es)",
          "Amenaça amb un recàrrec per fer pressa",
          "El remitent no és del domini oficial de la DGT",
        ],
      },
      L01: {
        texto:
          "AEAT: Té una notificació nova disponible. Pot consultar-la accedint pels seus propis mitjans a la Seu electrònica de l'Agència Tributària (sede.agenciatributaria.gob.es) o a la DEHú. Aquest missatge és només informatiu.",
        pistas: [
          "El text encaixa amb un avís oficial, però no prova qui l'envia: el remitent es pot falsificar. Per això no es confirma; es remet a la seu escrivint l'adreça",
          "Només avisa que hi ha una notificació; no demana dades, pagaments ni targeta",
          "No inclou cap enllaç per tocar: remet a la seu oficial .gob.es",
        ],
      },
      L02: {
        texto:
          "Assumpte: Dirección Electrónica Vial – Té una notificació nova. L'informem que té una notificació nova a la seva Dirección Electrónica Vial (DEV). Per consultar-la, accedeixi a la Seu electrònica de la DGT (sede.dgt.gob.es) i identifiqui's amb DNI electrònic, certificat digital o Cl@ve.",
        pistas: [
          "El text encaixa amb un avís oficial, però no prova qui l'envia: el remitent es pot falsificar. Per això no es confirma; es remet a la seu escrivint l'adreça",
          "Només el rep qui s'ha donat d'alta voluntàriament a la DEV",
          "No conté imports, terminis de 24 hores ni enllaços de pagament",
        ],
      },
      L03: {
        texto:
          `De: ${REMITENTE_CORREOS}. Assumpte: El teu enviament és de camí. Hola, el teu enviament amb referència PQ00000000000000000000 està en repartiment. El pots seguir al Localitzador d'Enviaments de www.correos.es o a l'app de Correos. Codi segur: XXXX-XXXX (requadre groc al final del missatge).`,
        pistas: [
          "El text encaixa amb un avís oficial, però no prova qui l'envia: el remitent es pot falsificar. Per això no es confirma; es remet a la seu escrivint l'adreça",
          `El remitent és ${REMITENTE_CORREOS}, el que Correos indica per a les seves comunicacions oficials, encara que un remitent es pot falsificar`,
          "Inclou un codi segur que es pot comprovar al verificador de correus de correos.es",
        ],
      },
      L04: {
        texto:
          "Assumpte: DEHú – Avís de notificació nova. L'informem que té a la seva disposició una notificació nova de l'Agència Estatal d'Administració Tributària a la Dirección Electrónica Habilitada única. Hi pot accedir a dehu.redsara.es identificant-se amb Cl@ve, certificat o DNIe. Aquest és un avís de cortesia.",
        pistas: [
          "El text encaixa amb un avís oficial, però no prova qui l'envia: el remitent es pot falsificar. Per això no es confirma; es remet a la seu escrivint l'adreça",
          "La DEHú envia 'avisos de cortesia' per correu quan arriba una notificació nova d'un organisme adherit",
          "Remet al domini oficial dehu.redsara.es, que no és .gob.es però sí que és oficial",
        ],
      },
      L05: {
        texto:
          "Pàgina 'Ajuda Sol·licitud de Cita en Atenció Primària – Portal del Pacient – Conselleria de Sanitat'. Per demanar cita amb el teu metge o infermeria d'atenció primària, introdueix el teu número SIP i la data de naixement i tria dia i hora.",
        pistas: [
          "L'URL és a la llista de dominis oficials (san.gva.es) i no porta paràmetres de redirecció",
          "Domini san.gva.es, subdomini oficial de la Generalitat Valenciana",
          "Demana el SIP i la data de naixement, però mai dades bancàries ni de targeta",
        ],
      },
    },
  },
  fuentes: {
    aria: "Fonts",
    oficiales: "Fonts oficials",
    verificadores: "Verificadors",
  },
} satisfies Diccionario;
