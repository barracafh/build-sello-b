import type { Diccionario } from "./es";

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
} satisfies Diccionario;
