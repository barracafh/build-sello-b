import type { ContextoTitular, Diccionario } from "./es";
import { ca, deEntitat } from "./ca";

// Valencià: parteix del català i només canvia el que és diferent (este,
// apegar, ferramenta, subjuntius en -es…).
// Traducció automàtica: l'ha de revisar una persona nativa.
export const va = {
  ...ca,
  saltarContenido: "Bota al contingut",
  pagina: {
    ...ca.pagina,
    titulo: "Este missatge és de veritat?",
    intro:
      "Apega un SMS, un correu o una web que diu ser de la DGT, d'Hisenda o d'un altre organisme i et direm si ho podem confirmar.",
  },
  pie: {
    ...ca.pie,
    descripcion: (nombre: string) =>
      `${nombre} és una ferramenta independent per a ajudar-te a identificar possibles fraus.`,
    aviso: "Ferramenta experimental. No és un servei oficial.",
    llamar017: "Telefona al 017",
    sobre: "Sobre la ferramenta",
    privacidad: "No guardem el que apegues ni obrim els seus enllaços.",
  },
  botonAviso: "Hi ha alguna cosa que no està bé? Avisa'ns",
  veredictos: {
    no_oficial: {
      ...ca.veredictos.no_oficial,
      titular: ({ entidad, hayEnlace }: ContextoTitular) => {
        const que = hayEnlace ? "Este enllaç" : "Este missatge";
        return entidad ? `${que} no és ${deEntitat(entidad)}` : `${que} no és oficial`;
      },
      entradilla: "No toques els seus enllaços i no respongues el missatge.",
      pasos: [
        "No toques l'enllaç ni respongues el missatge.",
        "Si vols comprovar alguna cosa, entra tu en la web oficial escrivint l'adreça.",
        "Si ja l'has tocat o has donat dades, telefona gratis al 017.",
      ],
    },
    no_determinable: {
      ...ca.veredictos.no_determinable,
      titular: ({ entidad }: ContextoTitular) =>
        entidad ? `No podem confirmar que siga ${deEntitat(entidad)}` : "No podem saber qui l'envia",
      pasos: [
        "No toques l'enllaç ni respongues el missatge.",
        "Entra tu en la web oficial escrivint l'adreça.",
        "Si dubtes, telefona gratis al 017.",
      ],
    },
    oficial_verificado: {
      ...ca.veredictos.oficial_verificado,
      titular: ({ entidad }: ContextoTitular) =>
        entidad ? `Esta web és ${deEntitat(entidad)}` : "Esta web està en la nostra llista de webs oficials",
      entradilla:
        "Només comprovem l'adreça, no el que et demanen dins. Per a tornar a entrar, escriu tu l'adreça.",
      pasos: [
        "Tot i això, no dones dades si no ho esperaves.",
        "Si dubtes, entra tu escrivint l'adreça de la web oficial.",
        "Si ja has donat dades, telefona gratis al 017 d'INCIBE.",
      ],
    },
  },
  analizar: {
    ...ca.analizar,
    etiquetaCampo: "Apega ací el missatge que t'ha arribat",
    ayudaCampo:
      "Pot ser un SMS, un correu o l'enllaç d'una web. Inclou el remitent i l'enllaç tal com apareixen.",
    noPulses: "No toques l'enllaç.",
    ayudaImagen: "PNG, JPG o WebP de fins a 4 MB. Traiem el text perquè el revises.",
    privacidad: "No guardem el que apegues ni les imatges, ni obrim els seus enllaços.",
    ejemplos: "Vols provar amb un exemple?",
    remitente: "Remitent del missatge",
    webOficialEs: (entidad: string | null) =>
      entidad ? `La web oficial ${deEntitat(entidad)} és` : "La web oficial és",
    irWebOficial: "Ves a la web oficial",
    desmentidosTexto: "Verificadors de notícies han publicat sobre missatges semblants a este.",
    desmentidosNoPrueba: "Això no prova per si sol que este siga fals.",
    llamar017: "Telefona al 017",
    copiarEnlace: "Copia l'enllaç a este resultat",
    avisoEnlace:
      "El missatge va dins de l'enllaç i no arriba al nostre servidor, però qui tinga l'enllaç el podrà llegir. No el compartisques si porta dades personals.",
    enlaceCopiado: "Enllaç copiat. Qui l'òbriga veurà este missatge i el seu resultat.",
    enlaceNoCopiado:
      "No l'hem pogut copiar. L'enllaç ja està en la barra d'adreces: copia'l des d'allí.",
    sinClasificadorOficial:
      "L'adreça està en la nostra llista de webs oficials. Ara mateix no hem pogut analitzar la resta del text.",
    webCitadaDe: (entidad: string) =>
      `El missatge cita una adreça que sí que és la web oficial ${deEntitat(entidad)}. Això no prova qui l'envia: entra escrivint tu l'adreça.`,
  },
  errores: {
    ...ca.errores,
    vacio: "Escriu o apega un missatge abans de comprovar-lo.",
    imagenSinTexto: "No hem trobat text en la imatge. Copia el missatge i apega'l.",
    imagen: {
      ...ca.errores.imagen,
      ia: "No hem pogut llegir la imatge. Copia el text del missatge i apega'l.",
      elegir: "Tria una imatge per a llegir-la.",
    },
  },
  compartir: {
    ...ca.compartir,
    titulo: "Envia-ho a la teua família",
    explicacion:
      "Hi va el missatge que has comprovat, amb els enllaços desactivats, i el resultat. Lleva abans el que siga personal.",
    copiado: "Text copiat. Apega'l en el xat de la teua família.",
    meHaLlegado: "M'ha arribat este missatge:",
    pie: (nombre: string, url: string) =>
      `Ho he comprovat amb ${nombre}, una ferramenta experimental que no és un servei oficial: ${url}`,
    ayuda017: "Si dubtes o ja has donat dades, telefona gratis al 017 d'INCIBE.",
    laWeb: (entidad: string | null, direccion: string) =>
      `La web oficial${entidad ? ` ${deEntitat(entidad)}` : ""} és ${direccion}`,
    noPulsesUrl: (url: string) => `No toques l'enllaç ni respongues: ${url}`,
    noRespondasRemitente: (remitente: string) => `No respongues este remitent: ${remitente}`,
    noPulses: "No toques els seus enllaços ni respongues.",
    oficial: (entidad: string | null, url: string | null) =>
      `He comprovat una web i està en la llista de webs oficials${entidad ? ` ${deEntitat(entidad)}` : ""}${url ? `: ${url}` : "."}`,
    noDesDatos: "Tot i això, no dones dades si no ho esperaves.",
    citaOficial: "El missatge cita la web oficial, però això no prova qui l'envia.",
    mejorNoPulses: (url: string) => `Millor no toques l'enllaç: ${url}`,
    mejorNoRespondas: "Millor no respongues ni toques res.",
  },
} satisfies Diccionario;
