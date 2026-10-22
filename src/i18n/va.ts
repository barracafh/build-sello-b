import type { Diccionario } from "./es";
import { ca } from "./ca";

// Valencià: parteix del català i només canvia el que és diferent.
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
} satisfies Diccionario;
