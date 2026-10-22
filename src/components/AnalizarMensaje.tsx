"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ClipboardPaste, ExternalLink, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ruta } from "@/config/sitio";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import { avisosIncibe, horario017, linea017 } from "@/datos/incibe";
import { NOMBRES_EJEMPLOS } from "@/datos/ejemplos";
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
// que no lo guarda ni lo registra.
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

// `intro` va encima del formulario, en su columna: así el panel de ejemplos
// arranca a la altura de la entradilla en escritorio. Los ejemplos solo se
// enseñan con `conEjemplos` (la página lo activa con ?casos-test).
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
  const [puedePegar, setPuedePegar] = useState(false);
  const [avisoPegar, setAvisoPegar] = useState<string | null>(null);
  // Lo que un lector de pantalla tiene que oír sin que se mueva el foco:
  // que se está comprobando y qué ejemplo se ha cargado en el campo.
  const [estado, setEstado] = useState("");
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const comprobarRef = useRef<HTMLButtonElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  // Descarta respuestas que llegan después de cambiar el mensaje.
  const peticion = useRef(0);

  // En el servidor no hay portapapeles: se decide en el navegador.
  useEffect(() => {
    setPuedePegar(typeof navigator.clipboard?.readText === "function");
  }, []);

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
    setAvisoPegar(null);
    setEstado("");
  }

  // Tras pegar o empezar de nuevo, el foco vuelve al campo.
  function cargar(texto: string) {
    cambiar(texto);
    campoRef.current?.focus();
  }

  // Con un ejemplo, el foco va al botón de comprobar, justo debajo del texto
  // cargado: así se ve y no se abre el teclado del móvil.
  function probarEjemplo(texto: string, nombre: string) {
    cambiar(texto);
    setEstado(`Ejemplo cargado: ${nombre}.`);
    comprobarRef.current?.focus();
  }

  async function analizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRespuesta(null);
    setAvisoPegar(null);
    if (mensaje.trim().length === 0) {
      setError({ texto: "Escribe o pega un mensaje antes de comprobar.", delCampo: true });
      return;
    }
    if (mensaje.length > LIMITE) {
      setError({
        texto: `El mensaje es demasiado largo: tiene ${miles(mensaje.length)} caracteres y el máximo es ${miles(LIMITE)}.`,
        delCampo: true,
      });
      return;
    }
    setError(null);
    setEnviando(true);
    setEstado("Comprobando el mensaje…");
    const esta = ++peticion.current;
    let datos: Respuesta | null = null;
    try {
      const res = await fetch(ruta("/api/verificar"), {
        method: "POST",
        body: JSON.stringify({ texto: mensaje }),
      });
      if (res.ok) datos = leerRespuesta(await res.json());
    } catch {
      // Sin red o sin JSON: igual que una respuesta sin veredicto.
    }
    // Si el mensaje ha cambiado mientras tanto, esta respuesta ya no vale.
    if (esta !== peticion.current) return;
    setEnviando(false);
    setEstado("");
    if (datos) setRespuesta(datos);
    else setError({ texto: "No hemos podido comprobarlo. Inténtalo de nuevo.", delCampo: false });
  }

  async function pegar() {
    try {
      const texto = await navigator.clipboard.readText();
      if (texto.trim().length === 0) {
        setAvisoPegar(
          "No hay nada copiado. Copia el mensaje y vuelve a pulsar «Pegar».",
        );
        return;
      }
      cargar(texto);
    } catch {
      setAvisoPegar(
        "No hemos podido pegarlo. Mantén pulsado el cuadro de texto y elige «Pegar».",
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
    ? soloRemitente
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
        avisosIncibe,
        linea017,
      ].filter((f, i, todas) => todas.findIndex((o) => o.url === f.url) === i)
    : [];
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
          {puedePegar && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={pegar}
                className="h-12 gap-2 px-5 text-lg max-sm:w-full"
              >
                <ClipboardPaste aria-hidden="true" className="size-5" />
                Pegar
              </Button>
              <p
                role="status"
                className="mt-2 text-base text-(--text-secondary) empty:mt-0"
              >
                {avisoPegar}
              </p>
            </div>
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
            {enviando ? "Comprobando…" : "Comprobar el mensaje"}
          </Button>
          <p
            id={`${id}-privacidad`}
            className="mt-3 text-base text-(--text-secondary)"
          >
            No guardamos lo que pegas ni abrimos sus enlaces.
          </p>
          <p role="status" className="sr-only">
            {estado}
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
                onClick={() => probarEjemplo(ejemplo.texto, ejemplo.nombre)}
                className="h-auto min-h-12 px-4 py-2 text-base whitespace-normal lg:justify-start lg:text-left"
              >
                {ejemplo.nombre}
              </Button>
            ))}
          </div>
        </section>
      )}

      {respuesta && ficha && (
        <section
          aria-labelledby={`${id}-resultado`}
          className="[&>*+*]:mt-10 lg:col-start-1 lg:row-start-2"
        >
          <div>
            <h2
              ref={tituloRef}
              id={`${id}-resultado`}
              tabIndex={-1}
              className="scroll-mt-6 text-[clamp(30px,5vw,44px)] leading-[1.12] tracking-[-0.03em] outline-none"
            >
              <Badge
                className={cn(
                  "h-auto justify-start gap-2 px-3 py-1.5 text-left font-sans text-xl font-semibold tracking-normal whitespace-normal [&>svg]:size-6!",
                  ficha.tono,
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

          {web && (
            // Una sola tarjeta con el sol por vista: la web oficial, el dato que más importa.
            <Card
              render={<section aria-labelledby={`${id}-web`} />}
              className="gap-3 bg-brand-yellow px-6 py-6 text-lg ring-0"
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
            </Card>
          )}

          <div>
            <h3 className="font-semibold">Por qué lo decimos</h3>
            <p className="mt-2">
              {frase}
              {respuesta.motivos.includes("sin_cifrado") &&
                " Eso sí, el enlace no está cifrado (http)."}
            </p>
            {respuesta.senales.length > 0 && (
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

          {ficha.pasos.length > 0 && (
            <div>
              <h3 className="font-semibold">Qué hacer ahora</h3>
              <ol className="mt-4 grid gap-5">
                {ficha.pasos.map((paso, i) => (
                  <li
                    key={paso}
                    className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                  >
                    <span
                      aria-hidden="true"
                      className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]"
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
            <Card
              render={<section aria-labelledby={`${id}-017`} />}
              className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 text-lg"
            >
              <div className="min-w-0 flex-[1_1_260px]">
                <p className="text-base text-(--text-secondary)">
                  ¿Dudas o ya has dado datos?
                </p>
                <h3 id={`${id}-017`} className="mt-1 leading-snug font-medium">
                  Línea 017 de INCIBE, gratuita y confidencial
                </h3>
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
            </Card>
          )}

          <ul className="text-base text-(--text-secondary)">
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

          <Fuentes fuentes={fuentes} />

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => cargar("")}
            className="h-12 px-5 text-lg max-sm:w-full"
          >
            Comprobar otro mensaje
          </Button>
        </section>
      )}
    </div>
  );
}
