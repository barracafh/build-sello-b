// Texto ya redactado para mandar el resultado a la familia por WhatsApp u otra
// app: solo el veredicto, la dirección analizada sin enlace, la web oficial, el
// 017 y el aviso de herramienta no oficial. El mensaje que pegó la persona no se
// comparte nunca: puede llevar su nombre, su DNI o su teléfono (LAB-82).
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
        ? [t.oficial(entidad, url || null), t.noDesDatos, t.ayuda017]
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

  const pie = `${t.pie(ficha.nombre, urlHerramienta(idioma))}\n${diccionario(idioma).pie.aviso}`;
  return [...parrafos, pie].filter(Boolean).join("\n\n");
}

/** El texto que se comparte: el resultado, sin el mensaje que se ha comprobado. */
export const textoParaFamilia = (respuesta: ParaCompartir, idioma: Idioma = "es") =>
  resumenParaFamilia(respuesta, idioma);

/** Enlace de WhatsApp que abre el chat con el texto ya escrito. */
export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
