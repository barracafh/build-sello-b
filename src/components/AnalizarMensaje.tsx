"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ExternalLink, Link2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ruta } from "@/config/sitio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import { CargaResultado } from "@/components/CargaResultado";
import { RETRASO_MS, esperaAntesDeMostrar } from "@/lib/carga";
import { avisosIncibe, horario017, linea017 } from "@/datos/incibe";
import { NOMBRES_EJEMPLOS, tipoDeEjemplo } from "@/datos/ejemplos";
import {
  deEntidad,
  fichaDe,
  leerRespuesta,
  mesDe,
  miles,
  webOficial,
  type Respuesta,
} from "@/lib/veredicto";
import ejemplos from "../../datos/mensajes-ejemplo.json";

// El texto vive en el estado del navegador y se envía solo a /api/verificar,
// que no lo guarda ni lo registra.
//
// Enlace para compartir: el mensaje va en el fragmento (#mensaje=…), que el
// navegador nunca envía al servidor, así que no acaba en ningún log.
const CLAVE_ENLACE = "mensaje";

const mensajeDelEnlace = () => {
  const valor = new URLSearchParams(window.location.hash.slice(1)).get(CLAVE_ENLACE);
  return valor?.trim() ? valor : null;
};

const quitarDelEnlace = () =>
  history.replaceState(null, "", window.location.pathname + window.location.search);
const LIMITE = 2000;
// El contador solo aparece cuando falta poco para el límite.
const AVISO_LIMITE = 1800;

type Ejemplo = (typeof ejemplos)[number] & {
  url_defanged?: string | null;
  url?: string;
};

const textoDeEjemplo = (caso: Ejemplo) => {
  const url = caso.url_prueba_sintetica ?? caso.url_defanged ?? caso.url;
  return url ? `${caso.texto} ${url}` : caso.texto;
};

const EJEMPLOS = (ejemplos as Ejemplo[]).map((caso) => ({
  id: caso.id,
  nombre: NOMBRES_EJEMPLOS[caso.id] ?? caso.id,
  tipo: tipoDeEjemplo(caso.id),
  // Lo que debería devolver, con la misma píldora que el resultado.
  esperado: fichaDe(caso.esperado),
  texto: textoDeEjemplo(caso),
}));

// Frase corta para cada código de `motivos` (LAB-34/38); el código nunca se muestra solo.
const frases: Record<string, string> = {
  contenido_sospechoso: "La web del enlace figura como oficial, pero el mensaje tiene señales de fraude: no podemos confirmarlo.",
  contenido_fraudulento: "El mensaje usa el nombre de un organismo oficial y tiene señales claras de fraude.",
  sin_enlace: "No hemos encontrado ningún enlace en el mensaje.",
  web_oficial_citada: "El mensaje cita una dirección que sí es una web oficial. Eso no prueba quién lo envía: entra tecleando tú la dirección.",
  url_no_valida: "El enlace no tiene un formato que podamos leer.",
  ip_como_host: "El enlace lleva a un número en vez de a un nombre de web, algo que las webs oficiales no hacen.",
  credenciales_en_url: "El enlace esconde la web real detrás de un @: lo que parece el nombre es solo un disfraz.",
  acortador_no_resuelto: "Es un enlace acortado y no lo abrimos, así que no sabemos adónde lleva.",
  inquilino_no_listado: "Está en una plataforma que usan muchos ayuntamientos, pero no es una web que conozcamos.",
  gob_es_no_listado: "Termina en gob.es, reservado a administraciones, pero no sabemos de qué organismo es.",
  marca_como_subdominio: "Usa el nombre de una web oficial al principio, pero la web real es otra.",
  imitacion_de_marca: "Imita el nombre de un organismo oficial y tiene otras señales de fraude.",
  posible_imitacion_de_marca: "Se parece al nombre de un organismo oficial, pero no podemos asegurar que sea falsa.",
  dominio_desconocido: "No es una web que tengamos en nuestra lista de webs oficiales.",
  homografo: "El nombre usa letras de otro alfabeto para parecerse a una web oficial.",
  indicador_publicado: "Un organismo oficial ha avisado de que esta dirección es un fraude.",
  remitente_dominio_ajeno: "El remitente usa el nombre de un organismo oficial con una dirección de correo que no es la suya.",
  en_allowlist: "La dirección está en nuestra lista de webs oficiales.",
};

// Título en castellano llano de cada señal del clasificador (LAB-39).
const titulosSenal: Record<string, string> = {
  pide_dinero: "Pide dinero",
  pide_datos: "Pide datos personales o bancarios",
  amenaza: "Amenaza con consecuencias graves",
  urgencia: "Mete prisa",
  ortografia: "Faltas o símbolos raros",
  remitente_falso: "Remitente que no cuadra",
  enlace_sospechoso: "Enlace sospechoso",
  enlace_no_listado: "Enlace que no conocemos",
  enlace_acortado: "Enlace acortado",
  enlace_parecido: "Enlace parecido a uno oficial",
  enlace_imita_oficial: "Enlace que imita a uno oficial",
  instruccion_qr: "Pide escanear un código QR",
  instruccion_rara: "Pide responder, descargar o llamar",
  devolucion_con_enlace: "Devolución con enlace para cobrar",
  aviso_informativo: "Parece un aviso informativo",
};

const MOTIVO_NO_DISPONIBLE = "clasificador no disponible";

// Los apartados de contexto.md en los que se apoyan las señales del clasificador.
const contextoMd = (señales: Respuesta["señales"]) => {
  const apartados = [
    ...new Set(señales.flatMap((s) => s.fuente.match(/§\d+(?:\.\d+)?/g) ?? [])),
  ];
  return {
    nombre: `Criterios de Sello (contexto.md${apartados.length ? ` ${apartados.join(", ")}` : ""})`,
    url: "https://github.com/barracafh/build-sello-b/blob/main/contexto.md",
  };
};

// `intro` va encima del formulario, en su columna: así el panel de ejemplos
// arranca a la altura de la entradilla en escritorio. Los ejemplos solo se
// enseñan con `conEjemplos`: la página lo activa por defecto y lo apaga con
// ?casos-test=false o =0. TODO(prod): volver a ocultarlo por defecto.
export function AnalizarMensaje({
  intro,
  conEjemplos = false,
}: {
  intro?: ReactNode;
  conEjemplos?: boolean;
}) {
  const id = useId();
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  // Solo los errores del mensaje marcan el campo como no válido; los de red, no.
  const [error, setError] = useState<{ texto: string; delCampo: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [avisoEnlace, setAvisoEnlace] = useState<string | null>(null);
  // El esqueleto sale solo si tarda más de RETRASO_MS; aquí, cuándo apareció.
  const [inicioCarga, setInicioCarga] = useState<number | null>(null);
  const inicioCargaRef = useRef<number | null>(null);
  const [transcurrido, setTranscurrido] = useState(0);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const comprobarRef = useRef<HTMLButtonElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  // Descarta respuestas que llegan después de cambiar el mensaje.
  const peticion = useRef(0);

  // Con zoom o en el móvil, el resultado sale por debajo: llevamos ahí el foco
  // y la vista para que nadie se lo pierda.
  useEffect(() => {
    const titulo = tituloRef.current;
    if (!respuesta || !titulo) return;
    titulo.focus({ preventScroll: true });
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    titulo.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
  }, [respuesta]);

  useEffect(() => {
    if (!enviando) return;
    const inicio = Date.now();
    const retraso = setTimeout(() => {
      inicioCargaRef.current = Date.now();
      setTranscurrido(Date.now() - inicio);
      setInicioCarga(inicioCargaRef.current);
    }, RETRASO_MS);
    const reloj = setInterval(() => setTranscurrido(Date.now() - inicio), 250);
    return () => {
      clearTimeout(retraso);
      clearInterval(reloj);
      inicioCargaRef.current = null;
      setInicioCarga(null);
    };
  }, [enviando]);
  const mostrarCarga = enviando && inicioCarga !== null;

  function cambiar(texto: string) {
    peticion.current++;
    setMensaje(texto);
    setRespuesta(null);
    setError(null);
    setEnviando(false);
    setAvisoEnlace(null);
  }

  // Al empezar de nuevo, el foco vuelve al campo y el enlace deja de llevar el mensaje.
  function cargar(texto: string) {
    cambiar(texto);
    quitarDelEnlace();
    campoRef.current?.focus();
  }

  // Con un ejemplo, el foco va al botón de comprobar, justo debajo del texto
  // cargado: así se ve y no se abre el teclado del móvil.
  function probarEjemplo(texto: string) {
    cambiar(texto);
    comprobarRef.current?.focus();
  }

  async function comprobar(texto: string) {
    setRespuesta(null);
    setAvisoEnlace(null);
    if (texto.trim().length === 0) {
      setError({ texto: "Escribe o pega un mensaje antes de comprobar.", delCampo: true });
      return;
    }
    if (texto.length > LIMITE) {
      setError({
        texto: `El mensaje es demasiado largo: tiene ${miles(texto.length)} caracteres y el máximo es ${miles(LIMITE)}.`,
        delCampo: true,
      });
      return;
    }
    setError(null);
    setEnviando(true);
    const esta = ++peticion.current;
    let datos: Respuesta | null = null;
    try {
      const res = await fetch(ruta("/api/verificar"), {
        method: "POST",
        body: JSON.stringify({ texto }),
      });
      if (res.ok) datos = leerRespuesta(await res.json());
    } catch {
      // Sin red o sin JSON: igual que una respuesta sin veredicto.
    }
    // Si el mensaje ha cambiado mientras tanto, esta respuesta ya no vale.
    if (esta !== peticion.current) return;
    // Si el esqueleto ya está en pantalla, se queda un mínimo para no parpadear.
    const espera = esperaAntesDeMostrar(inicioCargaRef.current, Date.now());
    if (espera > 0) {
      await new Promise((resolver) => setTimeout(resolver, espera));
      if (esta !== peticion.current) return;
    }
    setEnviando(false);
    if (datos) setRespuesta(datos);
    else setError({ texto: "No hemos podido comprobarlo. Inténtalo de nuevo.", delCampo: false });
  }

  function analizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void comprobar(mensaje);
  }

  // Si se abre un enlace con #mensaje=…, se rellena la caja y se comprueba solo.
  // También al pegar otro enlace en la misma pestaña (hashchange).
  const comprobarActual = useRef(comprobar);
  comprobarActual.current = comprobar;
  useEffect(() => {
    function desdeEnlace() {
      const texto = mensajeDelEnlace();
      if (!texto) return;
      peticion.current++;
      setMensaje(texto);
      void comprobarActual.current(texto);
    }
    desdeEnlace();
    window.addEventListener("hashchange", desdeEnlace);
    return () => window.removeEventListener("hashchange", desdeEnlace);
  }, []);

  async function copiarEnlace() {
    const params = new URLSearchParams({ [CLAVE_ENLACE]: mensaje });
    const enlace = `${window.location.origin}${window.location.pathname}${window.location.search}#${params}`;
    // También en la barra de direcciones, por si el portapapeles no deja copiar.
    history.replaceState(null, "", enlace);
    try {
      await navigator.clipboard.writeText(enlace);
      setAvisoEnlace("Enlace copiado. Quien lo abra verá este mensaje y su resultado.");
    } catch {
      setAvisoEnlace(
        "No hemos podido copiarlo. El enlace ya está en la barra de direcciones: cópialo desde ahí.",
      );
    }
  }

  const ficha = respuesta ? fichaDe(respuesta.veredicto) : null;
  const web = webOficial(respuesta?.web_oficial);
  const de = deEntidad(respuesta?.entidad);
  // El veredicto sale del remitente y no hay enlace: se habla del mensaje.
  const soloRemitente =
    respuesta?.veredicto === "no_oficial" &&
    Boolean(respuesta.remitente_analizado) &&
    !respuesta.url_analizada;
  // La web citada en prosa es oficial: se dice de quién, sin enlazarla (LAB-40).
  const webCitada = respuesta?.motivos[0] === "web_oficial_citada";
  const frase = respuesta
    ? respuesta.clasificado
      ? respuesta.motivo === MOTIVO_NO_DISPONIBLE
        ? "No hemos podido analizar el texto del mensaje ahora mismo, así que no podemos confirmar nada. Las señales que ves salen de reglas fijas."
        : respuesta.motivo
      : soloRemitente
      ? frases.remitente_dominio_ajeno
      : webCitada && respuesta.entidad
        ? `El mensaje cita una dirección que sí es la web oficial de ${respuesta.entidad}. Eso no prueba quién lo envía: entra tecleando tú la dirección.`
        : frases[respuesta.motivos.find((m) => frases[m]) ?? "dominio_desconocido"]
    : null;
  const hayRoja = respuesta?.senales.some((s) => s.nivel === "roja") ?? false;
  const fuentes = respuesta
    ? [
        ...(respuesta.indicador ? [respuesta.indicador] : []),
        ...(respuesta.aviso ? [respuesta.aviso] : []),
        ...(respuesta.fuente && respuesta.entidad
          ? [{ nombre: respuesta.entidad, url: respuesta.fuente }]
          : []),
        ...(respuesta.clasificado ? [contextoMd(respuesta.señales)] : []),
        avisosIncibe,
        linea017,
      ].filter((f, i, todas) => todas.findIndex((o) => o.url === f.url) === i)
    : [];
  // Cada verificador con su web, una sola vez (LAB-45).
  const verificadores = (respuesta?.desmentidos ?? [])
    .map((d) => ({ nombre: d.editor, url: new URL(d.url).origin }))
    .filter((f, i, todas) => todas.findIndex((o) => o.url === f.url) === i);
  const cercaDelLimite = mensaje.length >= AVISO_LIMITE;

  return (
    // En escritorio, dos columnas: formulario y resultado a la izquierda; ejemplos a la derecha.
    <div
      className={cn(
        "text-lg leading-relaxed",
        conEjemplos
          ? "max-lg:[&>*+*]:mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-16 lg:gap-y-12"
          : "[&>*+*]:mt-12",
      )}
    >
      <div className="lg:col-start-1 lg:row-start-1">
        {intro}
        <form
          onSubmit={analizar}
          aria-describedby={`${id}-privacidad`}
          className={intro ? "mt-10" : undefined}
        >
          <label htmlFor={`${id}-mensaje`} className="block text-xl font-medium">
            Pega aquí el mensaje que te ha llegado
          </label>
          <p id={`${id}-ayuda`} className="mt-1 text-(--text-secondary)">
            Puede ser un SMS, un correo o el enlace de una web. Incluye el
            remitente y el enlace tal como aparecen.{" "}
            <strong className="font-semibold text-foreground">
              No pulses el enlace.
            </strong>
          </p>
          <Textarea
            ref={campoRef}
            id={`${id}-mensaje`}
            name="mensaje"
            aria-describedby={cn(
              `${id}-ayuda`,
              cercaDelLimite && `${id}-contador`,
              error && `${id}-error`,
            )}
            aria-invalid={error?.delCampo || undefined}
            value={mensaje}
            onChange={(event) => cambiar(event.target.value)}
            rows={6}
            spellCheck={false}
            autoComplete="off"
            placeholder="DGT: Dispone de 24 horas para pagar su multa. Consulte en el siguiente enlace: hxxps://…"
            className="mt-4 min-h-44 px-4 py-3 text-lg leading-relaxed md:text-lg [overflow-wrap:anywhere]"
          />
          {cercaDelLimite && (
            <p
              id={`${id}-contador`}
              className={cn(
                "mt-2 text-base tabular-nums",
                mensaje.length > LIMITE
                  ? "font-medium text-destructive"
                  : "text-(--text-secondary)",
              )}
            >
              {miles(mensaje.length)} de {miles(LIMITE)} caracteres como máximo
            </p>
          )}
          {error && (
            <p
              id={`${id}-error`}
              role="alert"
              className="mt-2 font-medium text-destructive"
            >
              {error.texto}
            </p>
          )}
          <Button
            ref={comprobarRef}
            type="submit"
            // Si el resultado trae su propia acción principal (ir a la web
            // oficial), esta pasa a secundaria: una sola por pantalla.
            variant={web ? "outline" : "sunset"}
            size="lg"
            disabled={enviando}
            // Sin perder el foco mientras comprueba (un botón deshabilitado lo suelta).
            focusableWhenDisabled
            className="mt-6 h-14 px-6 text-lg max-sm:w-full"
          >
            {enviando ? (
              <>
                <Spinner />
                Comprobando…
              </>
            ) : (
              "Comprobar el mensaje"
            )}
          </Button>
          {/* Un solo anuncio al empezar. El veredicto lo lee el lector al recibir
              el foco su titular, y los errores ya son role="alert": aquí no se repiten. */}
          <p aria-live="polite" className="sr-only">
            {enviando ? "Comprobando el mensaje" : ""}
          </p>
          <p
            id={`${id}-privacidad`}
            className="mt-3 text-base text-(--text-secondary)"
          >
            No guardamos lo que pegas ni abrimos sus enlaces.
          </p>
        </form>
      </div>

      {conEjemplos && (
        <section
          aria-labelledby={`${id}-ejemplos`}
          className="lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:rounded-xl lg:bg-muted lg:p-6"
        >
          <h2 id={`${id}-ejemplos`} className="font-sans text-lg font-medium">
            ¿Quieres probar con un ejemplo?
          </h2>
          <div className="mt-3 flex flex-wrap gap-3 lg:flex-col">
            {EJEMPLOS.map((ejemplo) => (
              <Button
                key={ejemplo.id}
                type="button"
                variant="outline"
                onClick={() => probarEjemplo(ejemplo.texto)}
                className={cn(
                  "h-auto min-h-12 max-w-full flex-col items-start gap-1.5 border-l-4 px-4 py-2 text-left text-base whitespace-normal",
                  ejemplo.tipo === "Fraude" ? "border-l-destructive" : "border-l-muted-foreground",
                )}
              >
                <span>{ejemplo.nombre}</span>
                <span className="flex flex-wrap items-center gap-2 text-sm font-normal">
                  {ejemplo.tipo && <span className="font-semibold">{ejemplo.tipo}</span>}
                  <Badge
                    className={cn(
                      "h-auto gap-1.5 px-2 py-0.5 text-sm font-medium whitespace-normal [&>svg]:size-4!",
                      ejemplo.esperado.tono,
                    )}
                  >
                    <ejemplo.esperado.icono aria-hidden="true" />
                    <span className="sr-only">Debería dar: </span>
                    {ejemplo.esperado.etiqueta}
                  </Badge>
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}

      <div aria-busy={mostrarCarga} className="empty:hidden lg:col-start-1 lg:row-start-2">
      {mostrarCarga && <CargaResultado transcurrido={transcurrido} />}
      {respuesta && ficha && (
        // Tres bloques: el veredicto y por qué, qué hacer ahora y las fuentes.
        <section
          aria-labelledby={`${id}-resultado`}
          className="[&>*+*]:mt-8"
        >
          {/* 1 · Veredicto: cabecera teñida según el resultado y, debajo, el porqué. */}
          <Card render={<article />} className="gap-0 py-0 text-lg">
            <div className={cn("px-6 py-6 md:px-8 md:py-8", ficha.fondo)}>
              <h2
                ref={tituloRef}
                id={`${id}-resultado`}
                tabIndex={-1}
                className="scroll-mt-6 text-[clamp(30px,5vw,44px)] leading-[1.12] tracking-[-0.03em] outline-none"
              >
                <Badge
                  className={cn(
                    "h-auto justify-start gap-2 bg-background px-3 py-1.5 text-left font-sans text-xl font-semibold tracking-normal whitespace-normal text-foreground ring-1 ring-foreground/10 [&>svg]:size-6!",
                    ficha.colorIcono,
                  )}
                >
                  <ficha.icono aria-hidden="true" />
                  {ficha.etiqueta}
                </Badge>
                <span className="sr-only">. </span>
                <span className="mt-4 block">
                  {ficha.titular({ deEntidad: de, hayEnlace: !soloRemitente && !!respuesta.url_analizada })}
                </span>
              </h2>
              <p className="mt-4 text-xl font-semibold">{ficha.entradilla}</p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8 [&>*+*]:mt-8">
              <div>
                <h3 className="text-xl font-semibold">Por qué lo decimos</h3>
                <p className="mt-2">
                  {frase}
                  {respuesta.motivos.includes("sin_cifrado") &&
                    " Eso sí, el enlace no está cifrado (http)."}
                </p>
                {respuesta.veredicto === "no_oficial" && respuesta.entidad_suplantada && (
                  <p className="mt-2 text-(--text-secondary)">
                    Intenta hacerse pasar por: {respuesta.entidad_suplantada}
                  </p>
                )}
                {respuesta.clasificado && respuesta.señales.length > 0 && (
                  <ul className="mt-4 grid gap-3" aria-label="Señales encontradas">
                    {respuesta.señales.map((s) => {
                      const nivel = respuesta.senales.find((x) => x.codigo === s.codigo)?.nivel;
                      return (
                        <li key={s.codigo} className="flex flex-wrap items-start gap-x-3 gap-y-1">
                          {nivel && (
                            <Badge
                              className={cn(
                                "h-auto px-2.5 py-1 text-base font-semibold",
                                nivel === "roja"
                                  ? "bg-destructive/10 text-foreground"
                                  : "bg-(--warning) text-(--warning-foreground)",
                              )}
                            >
                              {nivel === "roja" ? "Señal roja" : "Señal naranja"}
                            </Badge>
                          )}
                          <span className="min-w-0 flex-[1_1_220px] [overflow-wrap:anywhere]">
                            <span className="font-semibold">
                              {titulosSenal[s.codigo] ?? "Otra señal"}.
                            </span>{" "}
                            {s.evidencia}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {!respuesta.clasificado && respuesta.senales.length > 0 && (
                  <ul className="mt-4 grid gap-3" aria-label="Señales encontradas">
                    {respuesta.senales.map((senal) => (
                      <li key={senal.codigo} className="flex flex-wrap items-start gap-x-3 gap-y-1">
                        {/* Texto en foreground o warning: el rojo sobre su tinte no llega a AA. */}
                        <Badge
                          className={cn(
                            "h-auto px-2.5 py-1 text-base font-semibold",
                            senal.nivel === "roja"
                              ? "bg-destructive/10 text-foreground"
                              : "bg-(--warning) text-(--warning-foreground)",
                          )}
                        >
                          {senal.nivel === "roja" ? "Señal roja" : "Señal naranja"}
                        </Badge>
                        <span className="min-w-0 flex-[1_1_220px]">{senal.texto}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {(soloRemitente ? respuesta.remitente_analizado : respuesta.url_analizada) && (
                  // Neutralizada y como texto: la dirección analizada nunca es un enlace.
                  <p className="mt-4 text-(--text-secondary)">
                    {soloRemitente
                      ? "Remitente del mensaje"
                      : webCitada
                        ? "Dirección citada"
                        : "Dirección del mensaje"}{" "}
                    (no la abras):{" "}
                    <code className="font-mono text-foreground [overflow-wrap:anywhere]">
                      {soloRemitente ? respuesta.remitente_analizado : respuesta.url_analizada}
                    </code>
                  </p>
                )}
              </div>

            </div>

            {web && (
              // Una sola tarjeta con el sol por vista: la web oficial, el dato que
              // más importa. A sangre, sin márgenes, cerrando el bloque del veredicto.
              <section
                aria-labelledby={`${id}-web`}
                className="flex flex-col gap-3 bg-brand-yellow px-6 py-6 md:px-8 md:py-8"
              >
                <h3 id={`${id}-web`} className="font-medium">
                  {de ? `La web oficial ${de} es` : "La web oficial es"}
                </h3>
                <p className="font-mono text-2xl leading-snug [overflow-wrap:anywhere] md:text-3xl">
                  {web.direccion}
                </p>
                <a
                  href={web.href}
                  className={cn(
                    buttonVariants({ variant: "sunset", size: "lg" }),
                    "mt-2 h-14 w-fit gap-2 px-6 text-lg max-sm:w-full",
                  )}
                >
                  Ir a la web oficial
                  <ExternalLink aria-hidden="true" className="size-5" />
                </a>
              </section>
            )}
          </Card>

          {respuesta.desmentidos.length > 0 && (
            // Señal de apoyo: enlaza los desmentidos, nunca la dirección analizada.
            <Card
              render={<section aria-labelledby={`${id}-desmentidos`} />}
              className="gap-3 px-6 py-6 text-lg md:px-8 md:py-8"
            >
              <h3 id={`${id}-desmentidos`} className="text-xl font-semibold">
                Ya lo han desmentido
              </h3>
              <p className="text-base text-(--text-secondary)">
                Verificadores de noticias han publicado sobre mensajes parecidos a este.
                {respuesta.veredicto !== "no_oficial" &&
                  " Eso no prueba por sí solo que este sea falso."}
              </p>
              <ul className="grid gap-2">
                {respuesta.desmentidos.map((d) => (
                  <li key={d.url}>
                    <a
                      href={d.url}
                      className="flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-2 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        <span className="block font-medium">{d.editor}</span>
                        <span className="block text-base text-(--text-secondary)">
                          «{d.calificacion}»
                          {mesDe(d.fecha) && ` · ${mesDe(d.fecha)}`}
                        </span>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* 2 · Qué hacer ahora: fondo beige (naranja de marca al 10 %), pasos
              numerados y, si toca, la línea 017. */}
          {(ficha.pasos.length > 0 || ficha.ofrece017 || hayRoja) && (
            <Card
              render={<section aria-labelledby={`${id}-pasos`} />}
              className="gap-0 bg-(--brand-orange)/10 py-0 text-lg ring-0"
            >
              {ficha.pasos.length > 0 && (
                <div className="px-6 py-6 md:px-8 md:py-8">
                  <h3 id={`${id}-pasos`} className="text-xl font-semibold">
                    Qué hacer ahora
                  </h3>
                  <ol className="mt-5 grid gap-5">
                    {ficha.pasos.map((paso, i) => (
                      <li
                        key={paso}
                        className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                      >
                        <span
                          aria-hidden="true"
                          // 24 px como mínimo: así cuenta como texto grande (3:1) sobre el beige.
                          className="text-[24px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]"
                        >
                          {i + 1}
                        </span>
                        <p>{paso}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(ficha.ofrece017 || hayRoja) && (
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-(--brand-orange)/25 px-6 py-6 md:px-8">
                  <div className="min-w-0 flex-[1_1_260px]">
                    <p className="text-base text-(--text-secondary)">
                      ¿Dudas o ya has dado datos?
                    </p>
                    <p className="mt-1 leading-snug font-medium">
                      Línea 017 de INCIBE, gratuita y confidencial
                    </p>
                    <p className="mt-1 text-base text-(--text-secondary)">
                      {horario017}
                    </p>
                  </div>
                  <a
                    href="tel:017"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 gap-2 px-5 text-lg max-md:w-full",
                    )}
                  >
                    <Phone aria-hidden="true" className="size-5" />
                    Llamar al 017
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* 3 · Fuentes oficiales: en el azul de Import@ss, como los enlaces del pie. */}
          <section
            aria-label="Fuentes y datos de la comprobación"
            className="rounded-xl bg-(--azul-importass) px-6 py-6 text-background md:px-8 md:py-8"
          >
            <Fuentes fuentes={fuentes} verificadores={verificadores} />
            <ul className="mt-6 text-base text-background/90">
              <li>
                Reputación del enlace:{" "}
                {respuesta.reputacion === "no_consultada" || !respuesta.reputacion
                  ? "no consultada"
                  : respuesta.reputacion}
              </li>
              <li>
                Registro del dominio:{" "}
                {respuesta.rdap === "no_disponible" || !respuesta.rdap
                  ? "no disponible"
                  : respuesta.rdap}
              </li>
            </ul>
          </section>

          <div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={copiarEnlace}
                className="h-12 gap-2 px-5 text-lg max-sm:w-full"
              >
                <Link2 aria-hidden="true" className="size-5" />
                Copiar enlace a este resultado
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => cargar("")}
                className="h-12 px-5 text-lg max-sm:w-full"
              >
                Comprobar otro mensaje
              </Button>
            </div>
            <p className="mt-3 text-base text-(--text-secondary)">
              El mensaje va dentro del enlace y no llega a nuestro servidor, pero
              quien tenga el enlace podrá leerlo. No lo compartas si lleva datos
              personales.
            </p>
            <p role="status" className="mt-2 text-base font-medium empty:mt-0">
              {avisoEnlace}
            </p>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
