"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ExternalLink, ImageUp, Link2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ruta } from "@/config/sitio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CompartirFamilia } from "@/components/CompartirFamilia";
import { Fuentes } from "@/components/Fuentes";
import { textoParaFamilia } from "@/lib/compartir";
import { avisosIncibe, linea017 } from "@/datos/incibe";
import { EJEMPLOS_PANEL, tipoDeEjemplo } from "@/datos/ejemplos";
import { diccionario, type Diccionario, type Idioma } from "@/i18n";
import {
  fichaDe,
  leerRespuesta,
  mesDe,
  miles,
  webOficial,
  type Respuesta,
} from "@/lib/veredicto";
import ejemplos from "../../datos/mensajes-ejemplo.json";

// El texto vive en el estado del navegador y se envía solo a /api/verificar,
// que no lo guarda ni lo registra. Una captura va a /api/imagen, que devuelve
// su texto para revisarlo aquí; la imagen tampoco se guarda.
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

const EJEMPLOS = (ejemplos as Ejemplo[])
  .filter((caso) => EJEMPLOS_PANEL.includes(caso.id))
  .map((caso) => ({
    id: caso.id,
    tipo: tipoDeEjemplo(caso.id),
    // Lo que debería devolver, con la misma píldora que el resultado.
    esperado: fichaDe(caso.esperado),
    texto: textoDeEjemplo(caso),
  }));

const MOTIVO_NO_DISPONIBLE = "clasificador no disponible";

// Los apartados de contexto.md en los que se apoyan las señales del clasificador.
const contextoMd = (señales: Respuesta["señales"], t: Diccionario) => {
  const apartados = [
    ...new Set(señales.flatMap((s) => s.fuente.match(/§\d+(?:\.\d+)?/g) ?? [])),
  ];
  return {
    nombre: t.analizar.criterios(apartados.length ? ` ${apartados.join(", ")}` : ""),
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
  idioma = "es",
}: {
  intro?: ReactNode;
  conEjemplos?: boolean;
  idioma?: Idioma;
}) {
  const id = useId();
  const t = diccionario(idioma);
  const a = t.analizar;
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  // Solo los errores del mensaje marcan el campo como no válido; los de red, no.
  const [error, setError] = useState<{ texto: string; delCampo: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [avisoEnlace, setAvisoEnlace] = useState<string | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const imagenRef = useRef<HTMLInputElement>(null);
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

  // Una sola llamada por imagen elegida. El texto rellena el campo para que la
  // persona lo revise antes de comprobarlo; la imagen no se conserva.
  async function leerCaptura(imagen: File | undefined) {
    if (imagenRef.current) imagenRef.current.value = "";
    if (!imagen) return;
    cambiar(mensaje);
    setLeyendo(true);
    const esta = peticion.current;
    let texto: string | null = null;
    // El servidor manda un `codigo`; el texto sale del diccionario.
    let fallo: string = t.errores.imagen.ia;
    try {
      const cuerpo = new FormData();
      cuerpo.set("imagen", imagen);
      const res = await fetch(ruta("/api/imagen"), { method: "POST", body: cuerpo });
      const datos = await res.json();
      if (res.ok && typeof datos.texto === "string") texto = datos.texto;
      else if (typeof datos.codigo === "string" && Object.hasOwn(t.errores.imagen, datos.codigo))
        fallo = t.errores.imagen[datos.codigo as keyof Diccionario["errores"]["imagen"]];
    } catch {
      // Sin red o sin JSON: se queda el mensaje de error por defecto.
    }
    setLeyendo(false);
    if (esta !== peticion.current) return;
    if (texto) cargar(texto);
    else
      setError({
        texto: texto === "" ? t.errores.imagenSinTexto : fallo,
        delCampo: false,
      });
  }

  async function comprobar(texto: string) {
    setRespuesta(null);
    setAvisoEnlace(null);
    if (texto.trim().length === 0) {
      setError({ texto: t.errores.vacio, delCampo: true });
      return;
    }
    if (texto.length > LIMITE) {
      setError({
        texto: t.errores.largo(miles(texto.length), miles(LIMITE)),
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
        body: JSON.stringify({ texto, idioma }),
      });
      if (res.ok) datos = leerRespuesta(await res.json());
    } catch {
      // Sin red o sin JSON: igual que una respuesta sin veredicto.
    }
    // Si el mensaje ha cambiado mientras tanto, esta respuesta ya no vale.
    if (esta !== peticion.current) return;
    setEnviando(false);
    if (datos) setRespuesta(datos);
    else setError({ texto: t.errores.red, delCampo: false });
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
    // El enlace lleva ?lang: quien lo abra ve el resultado en el mismo idioma.
    const busqueda = new URLSearchParams(window.location.search);
    busqueda.set("lang", idioma);
    const enlace = `${window.location.origin}${window.location.pathname}?${busqueda}#${params}`;
    // También en la barra de direcciones, por si el portapapeles no deja copiar.
    history.replaceState(null, "", enlace);
    try {
      await navigator.clipboard.writeText(enlace);
      setAvisoEnlace(a.enlaceCopiado);
    } catch {
      setAvisoEnlace(a.enlaceNoCopiado);
    }
  }

  const ficha = respuesta ? fichaDe(respuesta.veredicto) : null;
  const textos = ficha && t.veredictos[ficha.veredicto];
  const web = webOficial(respuesta?.web_oficial);
  const entidad = respuesta?.entidad ?? null;
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
        ? respuesta.veredicto === "oficial_verificado"
          ? a.sinClasificadorOficial
          : a.sinClasificador
        : respuesta.motivo
      : soloRemitente
      ? t.motivos.remitente_dominio_ajeno
      : webCitada && respuesta.entidad
        ? a.webCitadaDe(respuesta.entidad)
        : t.motivos[
            (respuesta.motivos.find((m) => Object.hasOwn(t.motivos, m)) ??
              "dominio_desconocido") as keyof Diccionario["motivos"]
          ]
    : null;
  const hayRoja = respuesta?.senales.some((s) => s.nivel === "roja") ?? false;
  const fuentes = respuesta
    ? [
        ...(respuesta.indicador ? [respuesta.indicador] : []),
        ...(respuesta.aviso ? [respuesta.aviso] : []),
        ...(respuesta.fuente && respuesta.entidad
          ? [{ nombre: respuesta.entidad, url: respuesta.fuente }]
          : []),
        ...(respuesta.clasificado ? [contextoMd(respuesta.señales, t)] : []),
        { ...avisosIncibe, nombre: a.avisosIncibe },
        { ...linea017, nombre: t.pie.linea017 },
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
            {a.etiquetaCampo}
          </label>
          <p id={`${id}-ayuda`} className="mt-1 text-(--text-secondary)">
            {a.ayudaCampo}{" "}
            <strong className="font-semibold text-foreground">{a.noPulses}</strong>
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
            placeholder={a.placeholder}
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
              {a.contador(miles(mensaje.length), miles(LIMITE))}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* El selector nativo queda oculto; se abre con el botón, que sí se ve y tiene foco. */}
            <Input
              ref={imagenRef}
              id={`${id}-imagen`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              onChange={(event) => leerCaptura(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={leyendo || enviando}
              focusableWhenDisabled
              aria-describedby={`${id}-imagen-ayuda`}
              onClick={() => imagenRef.current?.click()}
              className="h-12 gap-2 px-5 text-lg max-sm:w-full"
            >
              <ImageUp aria-hidden="true" className="size-5" />
              {leyendo ? a.leyendoImagen : a.subirCaptura}
            </Button>
            <p id={`${id}-imagen-ayuda`} className="min-w-0 flex-[1_1_200px] text-base text-(--text-secondary)">
              {a.ayudaImagen}
            </p>
          </div>
          <p role="status" className="sr-only">
            {leyendo ? a.leyendoImagen : ""}
          </p>
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
            disabled={enviando || leyendo}
            // Sin perder el foco mientras comprueba (un botón deshabilitado lo suelta).
            focusableWhenDisabled
            className="mt-6 h-14 px-6 text-lg max-sm:w-full"
          >
            {enviando ? a.comprobando : a.comprobar}
          </Button>
          <p
            id={`${id}-privacidad`}
            className="mt-3 text-base text-(--text-secondary)"
          >
            {a.privacidad}
          </p>
        </form>
      </div>

      {conEjemplos && (
        <section
          aria-labelledby={`${id}-ejemplos`}
          className="lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:rounded-xl lg:bg-muted lg:p-6"
        >
          <h2 id={`${id}-ejemplos`} className="font-sans text-lg font-medium">
            {a.ejemplos}
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
                <span>{t.ejemplos[ejemplo.id as keyof Diccionario["ejemplos"]] ?? ejemplo.id}</span>
                <span className="flex flex-wrap items-center gap-2 text-sm font-normal">
                  {ejemplo.tipo && (
                    <span className="font-semibold">
                      {ejemplo.tipo === "Fraude" ? a.fraude : a.legitimo}
                    </span>
                  )}
                  <Badge
                    className={cn(
                      "h-auto gap-1.5 px-2 py-0.5 text-sm font-medium whitespace-normal [&>svg]:size-4!",
                      ejemplo.esperado.tono,
                    )}
                  >
                    <ejemplo.esperado.icono aria-hidden="true" />
                    <span className="sr-only">{a.deberiaDar}</span>
                    {t.veredictos[ejemplo.esperado.veredicto].etiqueta}
                  </Badge>
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}

      {respuesta && ficha && textos && (
        // Tres bloques: el veredicto y por qué, qué hacer ahora y las fuentes.
        <section
          aria-labelledby={`${id}-resultado`}
          className="[&>*+*]:mt-8 lg:col-start-1 lg:row-start-2"
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
                  {textos.etiqueta}
                </Badge>
                <span className="sr-only">. </span>
                <span className="mt-4 block">
                  {textos.titular({ entidad, hayEnlace: !soloRemitente && !!respuesta.url_analizada })}
                </span>
              </h2>
              <p className="mt-4 text-xl font-semibold">{textos.entradilla}</p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8 [&>*+*]:mt-8">
              <div>
                <h3 className="text-xl font-semibold">{a.porQue}</h3>
                <p className="mt-2">
                  {frase}
                  {respuesta.motivos.includes("sin_cifrado") &&
                    ` ${a.sinCifrado}`}
                </p>
                {respuesta.veredicto === "no_oficial" && respuesta.entidad_suplantada && (
                  <p className="mt-2 text-(--text-secondary)">
                    {a.suplanta} {respuesta.entidad_suplantada}
                  </p>
                )}
                {respuesta.clasificado && respuesta.señales.length > 0 && (
                  <ul className="mt-4 grid gap-3" aria-label={a.senalesEncontradas}>
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
                              {nivel === "roja" ? a.senalRoja : a.senalNaranja}
                            </Badge>
                          )}
                          <span className="min-w-0 flex-[1_1_220px] [overflow-wrap:anywhere]">
                            <span className="font-semibold">
                              {t.senales.titulos[s.codigo as keyof Diccionario["senales"]["titulos"]] ??
                                a.otraSenal}
                              .
                            </span>{" "}
                            {s.evidencia}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {!respuesta.clasificado && respuesta.senales.length > 0 && (
                  <ul className="mt-4 grid gap-3" aria-label={a.senalesEncontradas}>
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
                          {senal.nivel === "roja" ? a.senalRoja : a.senalNaranja}
                        </Badge>
                        <span className="min-w-0 flex-[1_1_220px]">{t.senales.texto(senal)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {(soloRemitente ? respuesta.remitente_analizado : respuesta.url_analizada) && (
                  // Neutralizada y como texto: la dirección analizada nunca es un enlace.
                  <p className="mt-4 text-(--text-secondary)">
                    {soloRemitente ? a.remitente : webCitada ? a.direccionCitada : a.direccion}{" "}
                    {a.noLaAbras}{" "}
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
                  {a.webOficialEs(entidad)}
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
                  {a.irWebOficial}
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
                {a.desmentidos}
              </h3>
              <p className="text-base text-(--text-secondary)">
                {a.desmentidosTexto}
                {respuesta.veredicto !== "no_oficial" && ` ${a.desmentidosNoPrueba}`}
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
                          {mesDe(d.fecha, t.mes) && ` · ${mesDe(d.fecha, t.mes)}`}
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
          {(textos.pasos.length > 0 || ficha.ofrece017 || hayRoja) && (
            <Card
              render={<section aria-labelledby={`${id}-pasos`} />}
              className="gap-0 bg-(--brand-orange)/10 py-0 text-lg ring-0"
            >
              {textos.pasos.length > 0 && (
                <div className="px-6 py-6 md:px-8 md:py-8">
                  <h3 id={`${id}-pasos`} className="text-xl font-semibold">
                    {a.queHacer}
                  </h3>
                  <ol className="mt-5 grid gap-5">
                    {textos.pasos.map((paso, i) => (
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
                      {a.dudas017}
                    </p>
                    <p className="mt-1 leading-snug font-medium">
                      {a.linea017}
                    </p>
                    <p className="mt-1 text-base text-(--text-secondary)">
                      {a.horario017}
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
                    {a.llamar017}
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* 3 · Fuentes oficiales: en el azul de Import@ss, como los enlaces del pie. */}
          <section
            aria-label={a.fuentesYDatos}
            className="rounded-xl bg-(--azul-importass) px-6 py-6 text-background md:px-8 md:py-8"
          >
            <Fuentes fuentes={fuentes} verificadores={verificadores} idioma={idioma} />
            <ul className="mt-6 text-base text-background/90">
              <li>
                {a.reputacion}{" "}
                {respuesta.reputacion === "no_consultada" || !respuesta.reputacion
                  ? a.noConsultada
                  : respuesta.reputacion}
              </li>
              <li>
                {a.registro}{" "}
                {respuesta.rdap === "no_disponible" || !respuesta.rdap
                  ? a.noDisponible
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
                {a.copiarEnlace}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => cargar("")}
                className="h-12 px-5 text-lg max-sm:w-full"
              >
                {a.otroMensaje}
              </Button>
            </div>
            <p className="mt-3 text-base text-(--text-secondary)">
              {a.avisoEnlace}
            </p>
            <p role="status" className="mt-2 text-base font-medium empty:mt-0">
              {avisoEnlace}
            </p>
          </div>
        </section>
      )}

      {respuesta && (
        // Abajo del todo, a lo ancho: debajo del resultado y de los ejemplos.
        <div className="lg:col-span-2 lg:row-start-3">
          <CompartirFamilia
            titulo={t.compartir.titulo}
            explicacion={t.compartir.explicacion}
            texto={textoParaFamilia(mensaje, respuesta, idioma)}
            idioma={idioma}
          />
        </div>
      )}
    </div>
  );
}
