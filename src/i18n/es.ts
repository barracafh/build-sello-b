// Castellano: la fuente de verdad. Cada clave que se añade aquí la tienen que
// traer los otros idiomas, o `bun run typecheck` falla (ver `Diccionario`).
// Los nombres oficiales (Agencia Tributaria, Seguridad Social, DGT, Correos,
// INCIBE), el 017, las URL y los dominios no se traducen.
export const es = {
  saltarContenido: "Saltar al contenido",
  selector: { etiqueta: "Idioma" },
  cabecera: {
    datosReales: "Datos públicos",
    datosSimulados: "Datos simulados",
  },
  pagina: {
    antetitulo: "Verificador de mensajes",
    titulo: "¿Este mensaje es de verdad?",
    intro:
      "Pega un SMS, un correo o una web que dice ser de la DGT, Hacienda u otro organismo y te decimos si podemos confirmarlo.",
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
};

// Los literales se ensanchan a `string` para que cada idioma ponga su texto.
type Ampliar<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Ampliar<R>
    : { readonly [K in keyof T]: Ampliar<T[K]> };

export type Diccionario = Ampliar<typeof es>;
