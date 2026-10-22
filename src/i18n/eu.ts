import type { Diccionario } from "./es";

// Itzulpen automatikoa: jatorrizko hiztun batek berrikusi behar du.
export const eu = {
  saltarContenido: "Joan edukira",
  selector: { etiqueta: "Hizkuntza" },
  cabecera: {
    datosReales: "Datu publikoak",
    datosSimulados: "Datu simulatuak",
  },
  pagina: {
    antetitulo: "Mezu-egiaztatzailea",
    titulo: "Mezu hau benetakoa da?",
    intro:
      "Itsatsi DGTrena, Ogasunarena edo beste erakunde batena dela dioen SMS, mezu elektroniko edo webgune bat, eta baieztatu dezakegun esango dizugu.",
  },
  pie: {
    descripcion: (nombre: string) =>
      `${nombre} tresna independentea da, iruzur posibleak identifikatzen laguntzeko.`,
    aviso: "Tresna esperimentala. Ez da zerbitzu ofiziala.",
    organismos: "Erakunde ofizialak",
    ayuda: "Informazioa eta laguntza",
    llamar017: "Deitu 017ra",
    linea017: "INCIBEren 017 linea",
    avisosIncibe: "INCIBEren abisuak",
    sobre: "Tresnari buruz",
    privacidad: "Ez dugu gordetzen itsasten duzuna, eta ez ditugu haren estekak irekitzen.",
    squad: "Taldea",
  },
  botonAviso: "Zerbait gaizki dago? Jakinarazi iezaguzu",
} satisfies Diccionario;
