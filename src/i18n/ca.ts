import type { Diccionario } from "./es";

// Traducció automàtica: l'ha de revisar una persona nativa.
export const ca = {
  saltarContenido: "Salta al contingut",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    datosReales: "Dades públiques",
    datosSimulados: "Dades simulades",
  },
  pagina: {
    antetitulo: "Verificador de missatges",
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
} satisfies Diccionario;
