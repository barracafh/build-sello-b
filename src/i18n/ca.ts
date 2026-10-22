import { deEntidad } from "@/lib/veredicto";
import type { ContextoTitular, Diccionario } from "./es";

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
  },
  pagina: {
    titulo: "Aquest missatge és de veritat?",
    intro:
      "Enganxa un SMS, un correu o una web que diu ser de la DGT, d'Hisenda o d'un altre organisme i et direm si ho podem confirmar.",
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
    etiquetaCampo: "Enganxa aquí el missatge que t'ha arribat",
    ayudaCampo:
      "Pot ser un SMS, un correu o l'enllaç d'un web. Inclou el remitent i l'enllaç tal com apareixen.",
    noPulses: "No toquis l'enllaç.",
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
    url_no_valida: "L'enllaç no té un format que puguem llegir.",
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
    posible_imitacion_de_marca:
      "S'assembla al nom d'un organisme oficial, però no podem assegurar que sigui fals.",
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
    meHaLlegado: "M'ha arribat aquest missatge:",
    pie: (nombre: string, url: string) =>
      `Ho he comprovat amb ${nombre}, una eina experimental que no és un servei oficial: ${url}`,
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
  fuentes: {
    aria: "Fonts",
    oficiales: "Fonts oficials",
    verificadores: "Verificadors",
  },
} satisfies Diccionario;
