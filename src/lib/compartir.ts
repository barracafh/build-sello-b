// Texto ya redactado para mandar el resultado a la familia por WhatsApp u otra
// app. Lleva solo el veredicto, la dirección neutralizada y la web oficial:
// nunca el texto del mensaje, que puede llevar datos personales.
import { neutralizar } from "@/lib/url";
import { deEntidad, webOficial, type Respuesta } from "@/lib/veredicto";
import ficha from "../../ficha.json";

type ParaCompartir = Pick<
  Respuesta,
  "veredicto" | "motivos" | "url_analizada" | "remitente_analizado" | "entidad" | "web_oficial"
>;

const PIE = `Lo he comprobado con ${ficha.nombre}, una herramienta experimental que no es un servicio oficial: ${ficha.url}`;
const AYUDA_017 = "Si dudas o ya has dado datos, llama gratis al 017 de INCIBE.";

/** El resumen para la familia, en párrafos cortos. */
export function resumenParaFamilia(respuesta: ParaCompartir): string {
  const de = deEntidad(respuesta.entidad);
  const web = webOficial(respuesta.web_oficial);
  // Neutralizar es idempotente: aunque llegue viva, WhatsApp no la convierte en enlace.
  const url = respuesta.url_analizada && neutralizar(respuesta.url_analizada);
  const remitente = respuesta.remitente_analizado && neutralizar(respuesta.remitente_analizado);
  const queDice = de ? `un mensaje que dice ser ${de}` : "un mensaje";
  const laWeb = web && `La web oficial${de ? ` ${de}` : ""} es ${web.direccion}`;

  const parrafos: (string | null | false)[] =
    respuesta.veredicto === "no_oficial"
      ? [
          `He comprobado ${queDice}: NO es oficial.`,
          url
            ? `No pulses el enlace ni respondas: ${url}`
            : remitente
              ? `No respondas a este remitente: ${remitente}`
              : "No pulses sus enlaces ni respondas.",
          laWeb && `${laWeb}. Si tienes que hacer algo, entra tú escribiendo la dirección.`,
          AYUDA_017,
        ]
      : respuesta.veredicto === "oficial_verificado"
        ? [
            `He comprobado una web y está en la lista de webs oficiales${de ? ` ${de}` : ""}${url ? `: ${url}` : "."}`,
            "Aun así, no des datos si no lo esperabas.",
          ]
        : // Cualquier otro valor es la duda: nunca «oficial».
          [
            de
              ? `He comprobado ${queDice} y no se puede confirmar que lo sea.`
              : "He comprobado un mensaje y no se puede saber quién lo envía.",
            // La dirección citada es la oficial (LAB-40): no se dice que no se pulse.
            respuesta.motivos[0] === "web_oficial_citada"
              ? "El mensaje cita la web oficial, pero eso no prueba quién lo envía."
              : url
                ? `Mejor no pulses el enlace: ${url}`
                : "Mejor no respondas ni pulses nada.",
            laWeb && `${laWeb}. Entra tú escribiendo la dirección.`,
            AYUDA_017,
          ];

  return [...parrafos, PIE].filter(Boolean).join("\n\n");
}

/** Para que la familia tenga la herramienta a mano antes de que llegue el SMS. */
export const invitacionParaFamilia = () =>
  [
    "Si te llega un SMS o un correo de la DGT, Hacienda, Correos o la Seguridad Social y dudas, no pulses nada: pégalo aquí y te dice si es oficial.",
    `${ficha.nombre} (herramienta experimental, no es un servicio oficial): ${ficha.url}`,
  ].join("\n\n");

/** Enlace de WhatsApp que abre el chat con el texto ya escrito. */
export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/?text=${encodeURIComponent(texto)}`;
