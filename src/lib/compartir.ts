// Texto ya redactado para mandar el resultado a la familia por WhatsApp u otra
// app: el mensaje que se ha comprobado, con sus enlaces desactivados, y el
// veredicto con la web oficial. Se arma en el navegador y la persona lo puede
// editar antes de enviarlo (por ejemplo, para quitar datos personales).
import { neutralizar } from "@/lib/url";
import { webOficial, type Respuesta } from "@/lib/veredicto";
import { diccionario, type Idioma } from "@/i18n";
import ficha from "../../ficha.json";

type ParaCompartir = Pick<
  Respuesta,
  "veredicto" | "motivos" | "url_analizada" | "remitente_analizado" | "entidad" | "web_oficial"
>;

// El enlace a la herramienta lleva ?lang: quien lo abra la ve en el mismo idioma.
const urlHerramienta = (idioma: Idioma) => `${ficha.url}?lang=${idioma}`;

/** El resumen para la familia, en párrafos cortos y en `idioma`. */
export function resumenParaFamilia(respuesta: ParaCompartir, idioma: Idioma = "es"): string {
  const t = diccionario(idioma).compartir;
  const entidad = respuesta.entidad?.trim() || null;
  const web = webOficial(respuesta.web_oficial);
  // Neutralizar es idempotente: aunque llegue viva, WhatsApp no la convierte en enlace.
  const url = respuesta.url_analizada && neutralizar(respuesta.url_analizada);
  const remitente = respuesta.remitente_analizado && neutralizar(respuesta.remitente_analizado);
  const laWeb = web && t.laWeb(entidad, web.direccion);

  const parrafos: (string | null | false)[] =
    respuesta.veredicto === "no_oficial"
      ? [
          t.noOficial(entidad),
          url
            ? t.noPulsesUrl(url)
            : remitente
              ? t.noRespondasRemitente(remitente)
              : t.noPulses,
          laWeb && `${laWeb}. ${t.entraTu}`,
          t.ayuda017,
        ]
      : respuesta.veredicto === "oficial_verificado"
        ? [t.oficial(entidad, url || null), t.noDesDatos]
        : // Cualquier otro valor es la duda: nunca «oficial».
          [
            entidad ? t.dudaEntidad(entidad) : t.duda,
            // La dirección citada es la oficial (LAB-40): no se dice que no se pulse.
            respuesta.motivos[0] === "web_oficial_citada"
              ? t.citaOficial
              : url
                ? t.mejorNoPulses(url)
                : t.mejorNoRespondas,
            laWeb && `${laWeb}. ${t.entraTuCorto}`,
            t.ayuda017,
          ];

  return [...parrafos, t.pie(ficha.nombre, urlHerramienta(idioma))].filter(Boolean).join("\n\n");
}

const URL_CON_ESQUEMA = /(?:https?|hxxps?):\/\/[^\s<>"']+/gi;
// Dominios sueltos («dgt-multas.com», «sede.dgt.gob.es»): WhatsApp también los enlaza.
const DOMINIO_SUELTO = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;

/** Desactiva todas las direcciones del texto: ni WhatsApp ni el correo las enlazan. */
export const neutralizarTexto = (texto: string) =>
  texto
    // La puntuación final («…/x.») no es parte de la dirección.
    .replace(URL_CON_ESQUEMA, (url) => {
      const fin = /[.,;:!?)}»”]+$/.exec(url)?.[0] ?? "";
      return neutralizar(url.slice(0, url.length - fin.length)) + fin;
    })
    .replace(DOMINIO_SUELTO, (dominio) => dominio.replace(/\./g, "[.]"));

/** El mensaje comprobado, sin enlaces vivos, seguido del resultado. */
export const textoParaFamilia = (mensaje: string, respuesta: ParaCompartir, idioma: Idioma = "es") =>
  [
    diccionario(idioma).compartir.meHaLlegado,
    `«${neutralizarTexto(mensaje.trim())}»`,
    resumenParaFamilia(respuesta, idioma),
  ].join("\n\n");

/** Enlace de WhatsApp que abre el chat con el texto ya escrito. */
export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
