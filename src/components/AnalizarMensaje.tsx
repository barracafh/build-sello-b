"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ExternalLink, ImageUp, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ruta } from "@/config/sitio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarraComprobado } from "@/components/BarraComprobado";
import { CompartirFamilia } from "@/components/CompartirFamilia";
import { Desmentidos } from "@/components/Desmentidos";
import { Fuentes } from "@/components/Fuentes";
import { MensajeSenalado } from "@/components/MensajeSenalado";
import { CargaResultado } from "@/components/CargaResultado";
import { RETRASO_MS, esperaAntesDeMostrar } from "@/lib/carga";
import { formularioPlegado } from "@/lib/formulario";
import { useAltoCabecera } from "@/lib/alto-cabecera";
import { textoParaFamilia } from "@/lib/compartir";
import { avisosIncibe, horario017, linea017 } from "@/datos/incibe";
import { EJEMPLOS_PANEL, NOMBRES_EJEMPLOS, tipoDeEjemplo } from "@/datos/ejemplos";
import {
  deEntidad,
  fichaDe,
  leerRespuesta,
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
// enseñan con `conEjemplos`, que la página activa solo con ?casos-test=true.
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
  // El texto que se comprobó: los fragmentos de la respuesta son posiciones en él.
  const [analizado, setAnalizado] = useState("");
  // Solo los errores del mensaje marcan el campo como no válido; los de red, no.
  const [error, setError] = useState<{ texto: string; delCampo: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  // El esqueleto sale solo si tarda más de RETRASO_MS; aquí, cuándo apareció.
  const [inicioCarga, setInicioCarga] = useState<number | null>(null);
  const inicioCargaRef = useRef<number | null>(null);
  const [transcurrido, setTranscurrido] = useState(0);
  const [leyendo, setLeyendo] = useState(false);
  const imagenRef = useRef<HTMLInputElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const comprobarRef = useRef<HTMLButtonElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  // Descarta respuestas que llegan después de cambiar el mensaje.
  const peticion = useRef(0);
  useAltoCabecera();

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
  }

  // Al empezar de nuevo, el foco vuelve al campo y el enlace deja de llevar el mensaje.
  function cargar(texto: string) {
    cambiar(texto);
    quitarDelEnlace();
    campoRef.current?.focus();
  }

  // «Comprobar otro mensaje»: vuelve el formulario con el texto comprobado, para
  // corregirlo o cambiarlo. Se pinta antes de mover el foco al campo.
  function volverAlFormulario() {
    flushSync(() => {
      setRespuesta(null);
      setError(null);
    });
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
    let fallo = "No hemos podido leer la imagen. Copia el texto del mensaje y pégalo.";
    try {
      const cuerpo = new FormData();
      cuerpo.set("imagen", imagen);
      const res = await fetch(ruta("/api/imagen"), { method: "POST", body: cuerpo });
      const datos = await res.json();
      if (res.ok && typeof datos.texto === "string") texto = datos.texto;
      else if (typeof datos.error === "string") fallo = datos.error;
    } catch {
      // Sin red o sin JSON: se queda el mensaje de error por defecto.
    }
    setLeyendo(false);
    if (esta !== peticion.current) return;
    if (texto) cargar(texto);
    else
      setError({
        texto: texto === "" ? "No hemos encontrado texto en la imagen. Copia el mensaje y pégalo." : fallo,
        delCampo: false,
      });
  }

  async function comprobar(texto: string) {
    setRespuesta(null);
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
    if (datos) {
      setAnalizado(texto);
      setRespuesta(datos);
    }
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

  async function copiarEnlace(): Promise<string> {
    const params = new URLSearchParams({ [CLAVE_ENLACE]: mensaje });
    const enlace = `${window.location.origin}${window.location.pathname}${window.location.search}#${params}`;
    // También en la barra de direcciones, por si el portapapeles no deja copiar.
    history.replaceState(null, "", enlace);
    try {
      await navigator.clipboard.writeText(enlace);
      return "Enlace copiado. Quien lo abra verá este mensaje y su resultado.";
    } catch {
      return "No hemos podido copiarlo. El enlace ya está en la barra de direcciones: cópialo desde ahí.";
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
        ? respuesta.veredicto === "oficial_verificado"
          ? "La dirección está en nuestra lista de webs oficiales. No hemos podido analizar el resto del texto ahora mismo."
          : "No hemos podido analizar el texto del mensaje ahora mismo, así que no podemos confirmar nada. Las señales que ves salen de reglas fijas."
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
  const plegado = formularioPlegado(respuesta);

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
        {plegado && <BarraComprobado onOtro={volverAlFormulario} />}
        {/* Plegado sigue montado: así conserva el texto y el campo puede recibir el foco. */}
        <div hidden={plegado}>
          {intro}
          <form
            onSubmit={analizar}
            aria-describedby={`${id}-privacidad`}
            className={intro ? "mt-10" : undefined}
          >
            <label htmlFor={`${id}-mensaje`} className="block text-lg font-medium">
              Pega aquí el mensaje que te ha llegado
            </label>
            <p id={`${id}-ayuda`} className="mt-1 text-base text-(--text-secondary)">
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
              rows={3}
              spellCheck={false}
              autoComplete="off"
              placeholder="DGT: Dispone de 24 horas para pagar su multa. Consulte en el siguiente enlace: hxxps://…"
              // Fondo amarillo suave: aquí es donde se pega el mensaje. Crece con
              // el texto hasta el 20 % del alto de la pantalla sin la cabecera; a
              // partir de ahí, scroll dentro. Mínimo de 3 líneas (+ relleno y
              // borde) salvo que no quepan en ese 20 % (LAB-69).
              className="mt-3 [--alto-caja:calc((100dvh_-_var(--alto-cabecera,0px))*0.2)] max-h-(--alto-caja) min-h-[min(calc(3lh_+_1.5rem_+_2px),var(--alto-caja))] bg-brand-yellow/15 px-4 py-3 text-base leading-relaxed md:text-base [overflow-wrap:anywhere]"
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
            <p role="status" className="sr-only">
              {leyendo ? "Leyendo la imagen…" : ""}
            </p>
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="mt-2 text-base font-medium text-destructive"
              >
                {error.texto}
              </p>
            )}
            {/* Las dos acciones en una fila, también en el móvil (a partes iguales). */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:flex">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={leyendo || enviando}
                focusableWhenDisabled
                aria-describedby={`${id}-imagen-ayuda`}
                onClick={() => imagenRef.current?.click()}
                className="h-12 gap-2 px-3 text-base sm:px-4"
              >
                {/* A 320 px no cabe con icono. */}
                <ImageUp aria-hidden="true" className="size-5 max-[22.5rem]:hidden" />
                {leyendo ? "Leyendo…" : "Subir captura"}
              </Button>
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
                className="h-12 px-3 text-base sm:px-5"
              >
                {enviando ? (
                  <>
                    <Spinner />
                    Comprobando…
                  </>
                ) : (
                  // Dos textos enteros: con uno partido, el hueco del botón (gap) separa las palabras de más.
                  <>
                    <span className="sm:hidden">Comprobar</span>
                    <span className="max-sm:hidden">Comprobar mensaje</span>
                  </>
                )}
              </Button>
            </div>
            {/* Notas secundarias: más pequeñas y finas que el resto, a petición. */}
            <p id={`${id}-imagen-ayuda`} className="mt-2 text-sm font-light text-(--text-secondary)">
              Captura en PNG, JPG o WebP, hasta 4 MB.
            </p>
            {/* Un solo anuncio al empezar. El veredicto lo lee el lector al recibir
                el foco su titular, y los errores ya son role="alert": aquí no se repiten. */}
            <p aria-live="polite" className="sr-only">
              {enviando ? "Comprobando el mensaje" : ""}
            </p>
            <p
              id={`${id}-privacidad`}
              className="mt-0.5 text-sm font-light text-(--text-secondary)"
            >
              No guardamos lo que pegas ni las imágenes, ni abrimos sus enlaces.
            </p>
          </form>
        </div>
      </div>

      {conEjemplos && (
        // La columna ocupa las filas del formulario y el resultado: el panel se
        // queda fijo al hacer scroll y se para al llegar al final del resultado.
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <section
            aria-labelledby={`${id}-ejemplos`}
            className="lg:sticky lg:top-8 lg:rounded-xl lg:bg-muted lg:p-6"
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
        </div>
      )}

      <div aria-busy={mostrarCarga} className="empty:hidden lg:col-start-1 lg:row-start-2">
      {mostrarCarga && <CargaResultado transcurrido={transcurrido} />}
      {respuesta && ficha && (
        // Tres bloques: el veredicto y por qué, qué hacer ahora y las fuentes. En
        // escritorio y sin ejemplos, a dos columnas para que el veredicto y qué
        // hacer quepan sin bajar (LAB-69); en el móvil, uno debajo de otro.
        <section
          aria-labelledby={`${id}-resultado`}
          data-resultado
          className={cn(
            "max-lg:[&>*+*]:mt-8",
            conEjemplos
              ? "lg:[&>*+*]:mt-8"
              : "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8",
          )}
        >
          <div className="[&>*+*]:mt-8">
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

                <MensajeSenalado
                  id={`${id}-senalado`}
                  texto={analizado}
                  fragmentos={respuesta.fragmentos}
                />

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
                  <p className="font-mono text-2xl leading-snug [overflow-wrap:anywhere] md:text-3xl lg:text-2xl">
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
              <Desmentidos
                id={`${id}-desmentidos`}
                veredicto={respuesta.veredicto}
                desmentidos={respuesta.desmentidos}
              />
            )}
          </div>

          {/* Fija al bajar solo si cabe entera: en pantallas bajas taparía el contenido. */}
          <div className="[&>*+*]:mt-8 [@media(min-width:64rem)_and_(min-height:56rem)]:sticky [@media(min-width:64rem)_and_(min-height:56rem)]:top-8">
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

            <CompartirFamilia
              texto={textoParaFamilia(mensaje, respuesta)}
              onCopiarEnlace={copiarEnlace}
            />
          </div>

          {/* 3 · Fuentes oficiales: en el azul de Import@ss, como los enlaces del pie. */}
          <section
            aria-label="Fuentes y datos de la comprobación"
            className="rounded-xl bg-(--azul-importass) px-6 py-6 text-background md:px-8 md:py-8 lg:col-span-2"
          >
            <Fuentes fuentes={fuentes} verificadores={verificadores} />
            <ul className="mt-6 flex flex-wrap gap-x-8 text-base text-background/90">
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
        </section>
      )}
      </div>

    </div>
  );
}
