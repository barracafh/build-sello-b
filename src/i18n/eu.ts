import type { ContextoTitular, Diccionario } from "./es";

// Euskaraz izenari atzizkia gehitzea arriskutsua da (DGTrena, SEPErena…):
// «X erakundea» eran aipatzen da, izena ukitu gabe.
const erakundea = (izena: string) => `${izena} erakunde`;
const erakundearen = (izena: string) => `${izena} erakundearen`;
const erakundearena = (izena: string) => `${izena} erakundearena`;

const HILABETEAK = ["urtarrila", "otsaila", "martxoa", "apirila", "maiatza", "ekaina", "uztaila", "abuztua", "iraila", "urria", "azaroa", "abendua"];

// Seinale finkoen testua (src/lib/senales.ts), kodearen arabera.
const SEINALEEN_TESTUAK: Record<string, string> = {
  enlace_no_listado: "Esteka ez da ezagutzen dugun webgune ofizial batena.",
  enlace_acortado: "Esteka laburtuta dago eta ezkutatu egiten du nora daraman.",
  enlace_parecido: "Esteka erakunde ofizial baten izenaren antzekoa da.",
  enlace_no_valido: "Esteka gaizki idatzita dago: ez darama inongo webgune ofizialera.",
  enlace_imita_oficial: "Estekak erakunde ofizial baten izena imitatzen du.",
  amenaza: "Ondorio larriekin mehatxatzen du, hala nola bahiturekin edo atxiloketekin.",
  urgencia: "Presaka jartzen zaitu epe labur batekin edo «azken abisu» batekin.",
  ortografia: "Akatsak edo ikur arraroak ditu, erakunde ofizial batean ohikoa ez dena.",
  remitente_falso: "Igorleak zerbitzu ofizial baten izena erabiltzen du, beste helbide batekin.",
  pide_dinero: "Dirua eskatzen du, edo isun edo tasa baten ordainketa.",
  pide_datos: "Txartelaren datuak, gakoak, IBANa edo datu pertsonalak eskatzen ditu.",
  instruccion_qr: "QR kode bat eskaneatzeko eskatzen du.",
  instruccion_rara: "Erantzuteko, zerbait deskargatzeko edo ofiziala ez den zenbaki batera deitzeko eskatzen du.",
};

// Itzulpen automatikoa: jatorrizko hiztun batek berrikusi behar du.
export const eu = {
  saltarContenido: "Joan edukira",
  selector: { etiqueta: "Hizkuntza" },
  cabecera: {
    frase: "Egiaztatu fidatu aurretik.",
    secciones: "Atalak",
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
  veredictos: {
    no_oficial: {
      etiqueta: "Ez da ofiziala",
      titular: ({ entidad, hayEnlace }: ContextoTitular) => {
        const zer = hayEnlace ? "Esteka hau" : "Mezu hau";
        return entidad ? `${zer} ez da ${erakundea(entidad)}arena` : `${zer} ez da ofiziala`;
      },
      entradilla: "Ez sakatu bere estekak eta ez erantzun mezuari.",
      pasos: [
        "Ez sakatu estekan eta ez erantzun mezuari.",
        "Zerbait egiaztatu nahi baduzu, sartu zu zeu webgune ofizialean helbidea idatzita.",
        "Dagoeneko sakatu baduzu edo datuak eman badituzu, deitu doan 017ra.",
      ],
    },
    no_determinable: {
      etiqueta: "Ezin dugu baieztatu",
      titular: ({ entidad }: ContextoTitular) =>
        entidad
          ? `Ezin dugu baieztatu ${erakundea(entidad)}arena denik`
          : "Ezin dugu jakin nork bidaltzen duen",
      entradilla: "Testuak ofiziala dirudien arren, horrek ez du frogatzen nork bidaltzen duen.",
      pasos: [
        "Ez sakatu estekan eta ez erantzun mezuari.",
        "Sartu zu zeu webgune ofizialean helbidea idatzita.",
        "Zalantzarik baduzu, deitu doan 017ra.",
      ],
    },
    oficial_verificado: {
      etiqueta: "Webgune ofiziala",
      titular: ({ entidad }: ContextoTitular) =>
        entidad
          ? `Webgune hau ${erakundea(entidad)}arena da`
          : "Webgune hau gure webgune ofizialen zerrendan dago",
      entradilla:
        "Helbidea bakarrik egiaztatzen dugu, ez barruan eskatzen dizutena. Berriro sartzeko, idatzi zuk zeuk helbidea.",
      pasos: [
        "Hala ere, ez eman daturik espero ez bazenuen.",
        "Zalantzarik baduzu, sartu zu zeu webgune ofizialaren helbidea idatzita.",
        "Datuak eman badituzu, deitu doan INCIBEren 017ra.",
      ],
    },
  },
  analizar: {
    etiquetaCampo: "Itsatsi hemen jaso duzun mezua",
    ayudaCampo:
      "SMS bat, mezu elektroniko bat edo webgune baten esteka izan daiteke. Sartu igorlea eta esteka agertzen diren bezala.",
    noPulses: "Ez sakatu estekan.",
    placeholder: "DGT: 24 ordu dituzu isuna ordaintzeko. Kontsultatu esteka honetan: hxxps://…",
    contador: (actual: string, maximo: string) => `${actual} / ${maximo} karaktere gehienez`,
    subirCaptura: "Igo argazkia",
    leyendoImagen: "Irudia irakurtzen…",
    ayudaImagen: "PNG, JPG edo WebP argazkia, 4 MB arte.",
    comprobar: "Egiaztatu mezua",
    comprobarCorto: "Egiaztatu",
    leyendoCorto: "Irakurtzen…",
    comprobando: "Egiaztatzen…",
    privacidad: "Ez dugu gordetzen itsasten duzuna ezta irudiak ere, eta ez ditugu haien estekak irekitzen.",
    ejemplos: "Adibide batekin probatu nahi duzu?",
    deberiaDar: "Emaitza hau eman beharko luke: ",
    fraude: "Iruzurra",
    legitimo: "Legezkoa",
    porQue: "Zergatik diogun",
    sinCifrado: "Hori bai, esteka ez dago zifratuta (http).",
    suplanta: "Honen itxura hartu nahi du:",
    senalesEncontradas: "Aurkitutako seinaleak",
    senalRoja: "Seinale gorria",
    senalNaranja: "Seinale laranja",
    otraSenal: "Beste seinale bat",
    remitente: "Mezuaren igorlea",
    direccionCitada: "Aipatutako helbidea",
    direccion: "Mezuko helbidea",
    noLaAbras: "(ez ireki):",
    webOficialEs: (entidad: string | null) =>
      entidad ? `${erakundearen(entidad)} webgune ofiziala hau da:` : "Webgune ofiziala hau da:",
    irWebOficial: "Joan webgune ofizialera",
    desmentidos: "Dagoeneko ezeztatu dute",
    desmentidosTexto: "Albiste-egiaztatzaileek honen antzeko mezuei buruz argitaratu dute.",
    desmentidosNoPrueba: "Horrek berez ez du frogatzen hau faltsua denik.",
    queHacer: "Zer egin orain",
    dudas017: "Zalantzak dituzu edo datuak eman dituzu jada?",
    linea017: "INCIBEren 017 linea, doakoa eta konfidentziala",
    horario017: "8:00etatik 23:00etara, urteko 365 egunetan.",
    llamar017: "Deitu 017ra",
    fuentesYDatos: "Egiaztapenaren iturriak eta datuak",
    reputacion: "Estekaren ospea:",
    noConsultada: "kontsultatu gabe",
    registro: "Domeinuaren erregistroa:",
    noDisponible: "ez dago eskuragarri",
    copiarEnlace: "Kopiatu emaitza honetarako esteka",
    otroMensaje: "Egiaztatu beste mezu bat",
    avisoEnlace:
      "Mezua estekaren barruan doa eta ez da gure zerbitzarira iristen, baina esteka duenak irakurri ahal izango du. Ez partekatu datu pertsonalak baditu.",
    enlaceCopiado: "Esteka kopiatu da. Irekitzen duenak mezu hau eta bere emaitza ikusiko ditu.",
    enlaceNoCopiado:
      "Ezin izan dugu kopiatu. Esteka helbide-barran dago jada: kopiatu hortik.",
    criterios: (apartados: string) => `Sello-ren irizpideak (contexto.md${apartados})`,
    avisosIncibe: "INCIBE · Herritarrentzako abisuak",
    sinClasificadorOficial:
      "Helbidea gure webgune ofizialen zerrendan dago. Oraingoz ezin izan dugu testuaren gainerakoa aztertu.",
    sinClasificador:
      "Oraingoz ezin izan dugu mezuaren testua aztertu, beraz ezin dugu ezer baieztatu. Ikusten dituzun seinaleak arau finkoetatik datoz.",
    motivoSuplantacion: "Mezuak iruzur-itxuraren seinale argiak ditu.",
    webCitadaDe: (entidad: string) =>
      `Mezuak aipatzen duen helbidea ${erakundearen(entidad)} webgune ofiziala da. Horrek ez du frogatzen nork bidaltzen duen: sartu zuk zeuk helbidea idatzita.`,
  },
  errores: {
    vacio: "Idatzi edo itsatsi mezu bat egiaztatu aurretik.",
    largo: (actual: string, maximo: string) =>
      `Mezua luzeegia da: ${actual} karaktere ditu, eta gehienez ${maximo} izan daitezke.`,
    red: "Ezin izan dugu egiaztatu. Saiatu berriro.",
    imagenSinTexto: "Ez dugu testurik aurkitu irudian. Kopiatu mezua eta itsatsi.",
    imagen: {
      ia: "Ezin izan dugu irudia irakurri. Kopiatu mezuaren testua eta itsatsi.",
      elegir: "Aukeratu irudi bat irakurtzeko.",
      vacia: "Irudia hutsik dago.",
      grande: "Irudiak 4 MB baino gehiago ditu.",
      tipo: "Irudiak PNG, JPG edo WebP izan behar du.",
    },
  },
  motivos: {
    contenido_sospechoso:
      "Estekaren webgunea ofizial gisa ageri da, baina mezuak iruzur-seinaleak ditu: ezin dugu baieztatu.",
    contenido_fraudulento:
      "Mezuak erakunde ofizial baten izena erabiltzen du eta iruzur-seinale argiak ditu.",
    sin_enlace: "Ez dugu estekarik aurkitu mezuan.",
    web_oficial_citada:
      "Mezuak aipatzen duen helbidea webgune ofizial bat da. Horrek ez du frogatzen nork bidaltzen duen: sartu zuk zeuk helbidea idatzita.",
    url_no_valida: "Esteka gaizki idatzita dago. Webgune ofizialek ez dute inoiz horrelako estekarik bidaltzen: iruzurtzat hartu.",
    ip_como_host:
      "Estekak zenbaki batera eramaten du, ez webgune-izen batera, eta webgune ofizialek ez dute hori egiten.",
    credenciales_en_url:
      "Estekak benetako webgunea @ baten atzean ezkutatzen du: izena dirudiena mozorro bat baino ez da.",
    acortador_no_resuelto: "Esteka laburtua da eta ez dugu irekitzen, beraz ez dakigu nora daraman.",
    inquilino_no_listado:
      "Udal askok erabiltzen duten plataforma batean dago, baina ez da ezagutzen dugun webgune bat.",
    gob_es_no_listado:
      "gob.es-en amaitzen da, administrazioentzat gordea, baina ez dakigu zein erakunderena den.",
    marca_como_subdominio: "Hasieran webgune ofizial baten izena erabiltzen du, baina benetako webgunea beste bat da.",
    imitacion_de_marca: "Erakunde ofizial baten izena imitatzen du eta beste iruzur-seinale batzuk ditu.",
    posible_imitacion_de_marca:
      "Erakunde ofizial baten izenaren antza du, baina ezin dugu ziurtatu faltsua denik.",
    dominio_desconocido: "Ez dago gure webgune ofizialen zerrendan.",
    homografo: "Izenak beste alfabeto bateko letrak erabiltzen ditu webgune ofizial baten antza izateko.",
    indicador_publicado: "Erakunde ofizial batek ohartarazi du helbide hau iruzurra dela.",
    remitente_dominio_ajeno:
      "Igorleak erakunde ofizial baten izena erabiltzen du, baina posta-helbidea ez da berea.",
    en_allowlist: "Helbidea gure webgune ofizialen zerrendan dago.",
  },
  senales: {
    titulos: {
      pide_dinero: "Dirua eskatzen du",
      pide_datos: "Datu pertsonalak edo bankukoak eskatzen ditu",
      amenaza: "Ondorio larriekin mehatxatzen du",
      urgencia: "Presaka jartzen zaitu",
      ortografia: "Akatsak edo ikur arraroak",
      remitente_falso: "Bat ez datorren igorlea",
      enlace_sospechoso: "Esteka susmagarria",
      enlace_no_listado: "Ezagutzen ez dugun esteka",
      enlace_acortado: "Esteka laburtua",
      enlace_parecido: "Ofizial baten antzeko esteka",
      enlace_no_valido: "Gaizki idatzitako esteka",
      enlace_imita_oficial: "Ofizial bat imitatzen duen esteka",
      instruccion_qr: "QR kode bat eskaneatzeko eskatzen du",
      instruccion_rara: "Erantzuteko, deskargatzeko edo deitzeko eskatzen du",
      devolucion_con_enlace: "Itzulketa, kobratzeko esteka batekin",
      aviso_informativo: "Informazio-abisu bat dirudi",
    },
    texto: (senal: { codigo: string; texto: string }) => SEINALEEN_TESTUAK[senal.codigo] ?? senal.texto,
  },
  ejemplos: {
    F01: "Ogasunaren itzulketa (SMS)",
    F02: "DGTren isuna (SMS)",
    F03: "Correosen paketea (SMS)",
    F04: "Seguridad Socialaren txartela (SMS)",
    F05: "Isun baten errekargua (posta)",
    L01: "Ogasunaren jakinarazpena (SMS)",
    L02: "Dirección Electrónica Vial (posta)",
    L03: "Bidalketa baten jarraipena (posta)",
    L04: "DEHúren abisua (posta)",
    L05: "Osasun-zentroko hitzordua (webgunea)",
  },
  compartir: {
    titulo: "Bidali zure familiari",
    whatsapp: "Bidali WhatsApp bidez",
    otraVentana: " (beste leiho batean irekitzen da)",
    otraApp: "Beste aplikazio bat",
    copiar: "Kopiatu testua",
    copiado: "Testua kopiatu da. Itsatsi zure familiaren txatean.",
    noCopiado: "Ezin izan dugu kopiatu. Probatu «Bidali WhatsApp bidez» botoiarekin.",
    meHaLlegado: "Mezu hau iritsi zait:",
    pie: (nombre: string, url: string) =>
      `${nombre} tresnarekin egiaztatu dut. Tresna esperimentala da, ez zerbitzu ofiziala: ${url}`,
    ayuda017: "Zalantzarik baduzu edo datuak eman badituzu, deitu doan INCIBEren 017ra.",
    laWeb: (entidad: string | null, direccion: string) =>
      entidad
        ? `${erakundearen(entidad)} webgune ofiziala ${direccion} da`
        : `Webgune ofiziala ${direccion} da`,
    noOficial: (entidad: string | null) =>
      entidad
        ? `${erakundearena(entidad)} dela dioen mezu bat egiaztatu dut: EZ da ofiziala.`
        : "Mezu bat egiaztatu dut: EZ da ofiziala.",
    noPulsesUrl: (url: string) => `Ez sakatu estekan eta ez erantzun: ${url}`,
    noRespondasRemitente: (remitente: string) => `Ez erantzun igorle honi: ${remitente}`,
    noPulses: "Ez sakatu bere estekak eta ez erantzun.",
    entraTu: "Zerbait egin behar baduzu, sartu zuk zeuk helbidea idatzita.",
    oficial: (entidad: string | null, url: string | null) =>
      `Webgune bat egiaztatu dut eta ${entidad ? `${erakundearen(entidad)} ` : ""}webgune ofizialen zerrendan dago${url ? `: ${url}` : "."}`,
    noDesDatos: "Hala ere, ez eman daturik espero ez bazenuen.",
    dudaEntidad: (entidad: string) =>
      `${erakundearena(entidad)} dela dioen mezu bat egiaztatu dut, eta ezin da baieztatu hala denik.`,
    duda: "Mezu bat egiaztatu dut, eta ezin da jakin nork bidaltzen duen.",
    citaOficial: "Mezuak webgune ofiziala aipatzen du, baina horrek ez du frogatzen nork bidaltzen duen.",
    mejorNoPulses: (url: string) => `Hobe duzu estekan ez sakatzea: ${url}`,
    mejorNoRespondas: "Hobe duzu ez erantzutea eta ezer ez sakatzea.",
    entraTuCorto: "Sartu zuk zeuk helbidea idatzita.",
  },
  // «2025eko martxoa».
  mes: (mes: number, año: number) => `${año}ko ${HILABETEAK[mes]}`,
  fuentes: {
    aria: "Iturriak",
    oficiales: "Iturri ofizialak",
    verificadores: "Egiaztatzaileak",
  },
} satisfies Diccionario;
