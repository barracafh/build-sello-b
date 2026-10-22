import { REMITENTE_CORREOS, type ContextoTitular, type Diccionario } from "./es";

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
    menu: {
      verificar: { nombre: "Egiaztatu mezu bat", corto: "Egiaztatu" },
      juego: { nombre: "Jokoa: iruzurra ala ez?", corto: "Iruzurra?" },
    },
  },
  pagina: {
    titulo: "Mezu hau benetakoa da?",
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
    campo: {
      antes: "Itsatsi hemen SMSa, mezu elektronikoa edo webgunea jaso duzun bezala, ",
      negrita: "estekarik sakatu gabe",
      despues: ", eta baieztatu dezakegun esango dizugu.",
    },
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
    url_no_valida:
      "Esteka osatu gabe edo hautsita dago: ez sakatu; idatzi zuk zeuk erakundearen helbidea.",
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
    pie: (nombre: string, url: string) =>
      `${nombre} tresnarekin egiaztatu dut: ${url}`,
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
  emergencia: {
    seccion: "Dagoeneko zerbait egin baduzu",
    yaHasActuado: "Dagoeneko zerbait egin duzu?",
    cuentanos: "Kontatu zer gertatu den, eta orain zer egin esango dizugu.",
    yaHePulsado: "Sakatu egin dut →",
    queHiciste: "Zer egin zenuen?",
    marca: "Markatu dagokion guztia.",
    pasosDebajo: "Urratsak behean agertzen dira.",
    pasosDerecha: "Urratsak eskuinean agertzen dira.",
    cerrar: "Itxi",
    accionesAria: "Egindako ekintzak",
    anuncio: (n: number) => `${n} urrats zure kasurako.`,
    vacio: "Hemen ikusiko duzu zer egin, ordenan.",
    marcaArriba: "Markatu goian zer egin zenuen.",
    marcaIzquierda: "Markatu ezkerrean zer egin zenuen.",
    queHacerAhora: "Zer egin orain",
    cuantosPasos: (n: number) => `${n} urrats`,
    grupos: { primero: "Lehenik, oraintxe bertan", despues: "Ondoren", queHacer: "Zer egin" },
    verPasos: (n: number) => `Ikusi zure ${n} urratsak`,
    // Fuentes del modo emergencia: «INCIBE» y «017» los pone el componente.
    fuentes: { linea: "Zibersegurtasuneko laguntza-lerroa", reporte: "Iruzurren berri ematea" },
    acciones: {
      enlace: { label: "Esteka sakatu nuen", descripcion: "Webgunea ireki nuen, baina ez nuen ezer idatzi" },
      tarjeta: { label: "Txartelaren edo bankuaren datuak sartu nituen", descripcion: "Txartel-zenbakia, CVVa, kontua…" },
      clave: { label: "Cl@ve pasahitza edo sarbide-datuak eman nituen", descripcion: "Erabiltzailea, pasahitza edo jasotako kodea" },
      instale: { label: "Zerbait instalatu edo fitxategi bat deskargatu nuen", descripcion: "Aplikazio bat, eranskin bat…" },
      pague: { label: "Ordaindu nuen", descripcion: "Transferentzia edo kargu bat egin nuen" },
    },
    pasos: {
      banco: "Deitu orain zure bankura eta esan txartela edo kontua blokeatzeko. Telefonoa txartelaren atzealdean dago.",
      "banco-pago": "Deitu zure bankura, azaldu zer gertatu den eta galdetu dirua itzul diezazuketen.",
      capturas: "Atera argazki bat mugikorrarekin jaso zenuen mezuari, gordeta izateko gero behar baduzu.",
      "cambiar-clave": "Aldatu Cl@ve pasahitza ahalik eta lasterren. Idatzi zuk zeuk helbidea nabigatzailean; ez sakatu estekarik.",
      "revisar-dehu": "Sartu zure jakinarazpen-postontzian eta Herritarren Karpetan helbidea zuk zeuk idatzita, eta begiratu ea zerbait arraroa dagoen.",
      "no-dispositivo": "Ez erabili telefono edo ordenagailu hori bankuan sartzeko edo pasahitzak idazteko, konfiantzazko norbaitek begiratu arte.",
      "no-enlace": "Ez sakatu berriro esteka hori, eta ez deitu mezuan agertzen zen zenbakira.",
      denuncia: "Jarri salaketa Polizia Nazionalean edo Guardia Zibilean. Interneten bidez edo bertara joanda egin dezakezu.",
      "017": "Deitu 017ra, doakoa da. Egunero artatzen dute, goizeko 8etatik gaueko 11ak arte, eta zehatz azaltzen dizute zer egin.",
      "reporte-incibe": "Jakinarazi zibersegurtasuneko erakunde ofizialari (INCIBE) zer gertatu den.",
    },
  },
  senalado: {
    titulo: "Horrela ikusten da zure mezuan",
    continuo: "Azpimarra jarraitua",
    trazos: "Azpimarra etena",
    roja: "seinale gorria",
    naranja: "seinale laranja",
  },
  carga: {
    pasos: ["Esteka berrikusten…", "Iruzur-seinaleak bilatzen…", "Iturri ofizialak kontsultatzen…"],
    lenta: "Honek segundo batzuk gehiago iraun dezake.",
  },
  juego: {
    antetitulo: "Jokoa · 10 mezu",
    titulo: "Iruzurra ala ez?",
    intro:
      "INCIBEk ohartarazitako benetako bost iruzur eta egiazko bost abisu. Irristatu ezkerrera iruzurra bada, eta eskuinera egiazkoa bada.",
    tipos: { sms: "SMS", email: "Posta", web: "Web" },
    mensajeDe: (n: string, total: string) => `${n}. mezua (${total}etik)`,
    aciertos: (n: string) => `Asmatuak: ${n}`,
    tarjeta: "txartela",
    etiquetaTarjeta: (n: string, tipo: string) => `${n}. mezua: ${tipo}`,
    estafa: "Iruzurra",
    deVerdad: "Egiazkoa",
    desliza: "Irristatu txartela",
    flechas: (izquierda: string, derecha: string) =>
      ` edo erabili teklatuko ${izquierda} eta ${derecha} geziak`,
    bienVisto: "Ondo ikusita!",
    estaNo: "Hau ez",
    esEstafa: "INCIBEk ohartarazitako benetako iruzurra da.",
    esDeVerdad: "Egiazko abisua da. Hala ere, ez fidatu mezuaz: sartu zuk zeuk webgune ofizialean.",
    lasPistas: "Pistak",
    webOficialEs: "Webgune ofiziala hau da:",
    fuente: "Iturria:",
    webOficial: "Webgune ofiziala",
    siguiente: "Hurrengo mezua",
    verResultado: "Ikusi nire emaitza",
    resultado: (aciertos: string, total: string) => `${total}etik ${aciertos} asmatu dituzu`,
    valoracion: {
      perfecto: "Bikain! Iruzur batek ere ez zaitu engainatu.",
      muyBien: "Oso ondo. Berrikusi huts egin dituzunak: horiek engainatzen dute gehien.",
      noEstaMal: "Ez dago gaizki, baina iruzurren batek engainatuko zintuen.",
      repasa: "Iruzurrak oso ondo eginda daude. Berrikusi pistak eta saiatu berriro.",
    },
    recuerda:
      "Gogoratu: abisu bat egiazkoa izan arren, sartu zuk zeuk webgune ofizialean helbidea idatzita. Mezu batek ez du frogatzen nork bidaltzen duen.",
    tusRespuestas: "Zure erantzunak",
    acertada: "Asmatua: ",
    fallada: "Huts egina: ",
    respuestaEstafa: "iruzurra",
    respuestaDeVerdad: "egiazkoa",
    otraVez: "Jokatu berriro",
    comprobarReal: "Egiaztatu benetako mezu bat",
    casos: {
      F01: {
        texto:
          "AGENCIA TRIBUTARIA: Zure 2023ko errentako PFEZaren itzulketaren 411,00¿ ordainketa agindu da. informazio gehiago webgunean:",
        pistas: [
          "Diru-itzulketa bat agintzen du eta esteka bat sakatzeko eskatzen du",
          "Estekak ez darama sede.agenciatributaria.gob.es helbidera",
          "Webgune faltsuak izen osoa, txartel-zenbakia, iraungitze-data, CVVa eta PINa eskatzen ditu; AEATk ez du inoiz txartelaren daturik eskatzen SMS bidez",
        ],
      },
      F02: {
        texto:
          "DGT: 24 ordu geratzen zaizkizu 2024/06/13ko isuna ordaintzeko. Kontsultatu esteka honetan:",
        pistas: [
          "Presa sartzen du 24 orduko epearekin, errekargu bat saihesteko",
          "DGTk isunak gutun ziurtatuz edo DEV (Dirección Electrónica Vial) bidez jakinarazten ditu, ez SMS bateko ordainketa-estekekin",
          "Igorlearen 'DGT' ezizena faltsutu daiteke",
        ],
      },
      F03: {
        texto:
          "[CORREOS] Bezero agurgarria: Zure paketea ezin izan da ee/hh egunean entregatu, aduana-tasak X,XX€ ordaindu ez direlako: Jarraitu jarraibideei: [URL iruzurtia]",
        pistas: [
          "Diru kopuru txiki bat (aduana-tasak) esteka baten bidez ordaintzeko eskatzen du",
          "Correosek ez du inoiz banku-daturik edo ordainketarik eskatzen SMS edo posta bidez",
          "Enpresaren izena erabiltzen du correos.es ez den domeinu baten barruan",
        ],
      },
      F04: {
        texto:
          "GIZARTE SEGURANTZA: Zure osasun-txartelak eguneraketa bat behar du. Mesedez eguneratu hori gune seguruaren bidez zure zerbitzuak mantentzeko: [URL maltzurra]",
        pistas: [
          "Datuak esteka baten bidez 'eguneratzeko' eskatzen du, eta zerbitzuak galtzeko mehatxua egiten du",
          "Gizarte Segurantzak ez du eskatzen datuak eguneratzeko edo zorrak ordaintzeko SMSetako esteken bidez (INCIBE, 2026/08/19ko abisua)",
          "Itzulpen arraroa eta hitz-ordena okerra ('eguneratu hori')",
        ],
      },
      F05: {
        texto:
          "Gaia: Azken gogorarazpena zure isunaren errekarguaren aurretik – Espedientea zk,. XXXXXXX",
        pistas: [
          "'DGTk EZ ditu INOIZ isunak posta elektronikoz jakinarazten' (dgt.es)",
          "Errekargu batekin mehatxatzen du presa sartzeko",
          "Igorlea ez da DGTren domeinu ofizialekoa",
        ],
      },
      L01: {
        texto:
          "AEAT: Jakinarazpen berri bat duzu eskuragarri. Zeure bitartekoez Zerga Agentziaren Egoitza elektronikoan (sede.agenciatributaria.gob.es) edo DEHún sartuta kontsulta dezakezu. Mezu hau informatiboa baino ez da.",
        pistas: [
          "Testua abisu ofizial batekin bat dator, baina ez du frogatzen nork bidaltzen duen: igorlea faltsutu daiteke. Horregatik ez da berresten; egoitzara bidaltzen da, helbidea idatzita",
          "Jakinarazpen bat dagoela baino ez du esaten; ez du daturik, ordainketarik edo txartelik eskatzen",
          "Ez dakar sakatzeko estekarik: .gob.es egoitza ofizialera bidaltzen du",
        ],
      },
      L02: {
        texto:
          "Gaia: Dirección Electrónica Vial – Jakinarazpen berri bat duzu. Jakinarazten dizugu jakinarazpen berri bat duzula zure Dirección Electrónica Vial-en (DEV). Kontsultatzeko, sartu DGTren Egoitza elektronikoan (sede.dgt.gob.es) eta identifikatu NAN elektronikoarekin, ziurtagiri digitalarekin edo Cl@ve-rekin.",
        pistas: [
          "Testua abisu ofizial batekin bat dator, baina ez du frogatzen nork bidaltzen duen: igorlea faltsutu daiteke. Horregatik ez da berresten; egoitzara bidaltzen da, helbidea idatzita",
          "DEVn borondatez alta eman duenak baino ez du jasotzen",
          "Ez du zenbatekorik, 24 orduko eperik edo ordainketa-estekarik",
        ],
      },
      L03: {
        texto:
          `Nork: ${REMITENTE_CORREOS}. Gaia: Zure bidalketa bidean dago. Kaixo, PQ00000000000000000000 erreferentzia duen zure bidalketa banatzen ari dira. www.correos.es-eko Bidalketen Bilatzailean edo Correosen aplikazioan jarrai dezakezu. Kode segurua: XXXX-XXXX (koadro horia mezuaren amaieran).`,
        pistas: [
          "Testua abisu ofizial batekin bat dator, baina ez du frogatzen nork bidaltzen duen: igorlea faltsutu daiteke. Horregatik ez da berresten; egoitzara bidaltzen da, helbidea idatzita",
          `Igorlea ${REMITENTE_CORREOS} da, Correosek bere komunikazio ofizialetarako adierazten duena, nahiz eta igorle bat faltsutu daitekeen`,
          "Kode segurua dakar, correos.es-eko posta-egiaztatzailean egiazta daitekeena",
        ],
      },
      L04: {
        texto:
          "Gaia: DEHú – Jakinarazpen berriaren abisua. Jakinarazten dizugu Zerga Administrazioko Estatu Agentziaren jakinarazpen berri bat duzula eskura Dirección Electrónica Habilitada única-n. dehu.redsara.es helbidean sar zaitezke, Cl@ve, ziurtagiri edo NANe bidez identifikatuta. Adeitasun-abisu bat da hau.",
        pistas: [
          "Testua abisu ofizial batekin bat dator, baina ez du frogatzen nork bidaltzen duen: igorlea faltsutu daiteke. Horregatik ez da berresten; egoitzara bidaltzen da, helbidea idatzita",
          "DEHúk 'adeitasun-abisuak' bidaltzen ditu posta bidez, atxikitako erakunde baten jakinarazpen berri bat iristen denean",
          "dehu.redsara.es domeinu ofizialera bidaltzen du; ez da .gob.es, baina ofiziala da",
        ],
      },
      L05: {
        texto:
          "Orria: 'Lehen Mailako Arretan Hitzordua Eskatzeko Laguntza – Pazientearen Ataria – Conselleria de Sanidad'. Zure lehen mailako arretako medikuarekin edo erizainarekin hitzordua eskatzeko, idatzi zure SIP zenbakia eta jaiotze-data, eta aukeratu eguna eta ordua.",
        pistas: [
          "URLa domeinu ofizialen zerrendan dago (san.gva.es) eta ez darama birbideratze-parametrorik",
          "san.gva.es domeinua, Generalitat Valencianaren azpidomeinu ofiziala",
          "SIPa eta jaiotze-data eskatzen ditu, baina inoiz ez banku- edo txartel-daturik",
        ],
      },
    },
  },
  fuentes: {
    aria: "Iturriak",
    oficiales: "Iturri ofizialak",
    verificadores: "Egiaztatzaileak",
  },
} satisfies Diccionario;
