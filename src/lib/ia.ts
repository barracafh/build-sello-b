// HelmCode habla la API de OpenAI. Úsalo solo desde el servidor (rutas de
// src/app/api o Server Actions): en el navegador la clave no existe, y así debe ser.
// El modelo del evento (glm5.3-flash) lee texto e imágenes: para una imagen,
// manda `content` como lista de partes, con la imagen en data URL o https.
export type Parte =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
export type Mensaje = {
  role: "system" | "user" | "assistant";
  content: string | Parte[];
};

export type UsoIa = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type OpcionesIa = {
  // Por defecto, HELMCODE_MODEL.
  modelo?: string;
  temperatura?: number;
  // Pide `response_format: json_object`.
  formatoJson?: boolean;
  // Cancela la petición y también la espera entre reintentos.
  signal?: AbortSignal;
  // Recibe el uso de tokens que informa HelmCode, si lo informa.
  alUso?: (uso: UsoIa) => void;
};

export const base = () => process.env.HELMCODE_BASE_URL ?? "https://api.helmcode.com/v1";

// Espera `ms` y se corta si `signal` aborta.
const esperar = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolver, rechazar) => {
    if (signal?.aborted) return rechazar(signal.reason);
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", alAbortar);
      resolver();
    }, ms);
    const alAbortar = () => {
      clearTimeout(t);
      rechazar(signal?.reason);
    };
    signal?.addEventListener("abort", alAbortar, { once: true });
  });

export async function completar(
  messages: Mensaje[],
  { modelo, temperatura, formatoJson, signal, alUso }: OpcionesIa = {},
): Promise<string> {
  const { HELMCODE_API_KEY, HELMCODE_MODEL } = process.env;
  const model = modelo ?? HELMCODE_MODEL;
  if (!HELMCODE_API_KEY || !model)
    throw new Error("Faltan HELMCODE_API_KEY o HELMCODE_MODEL en .env.local");
  const cuerpo = JSON.stringify({
    model,
    messages,
    ...(temperatura !== undefined && { temperature: temperatura }),
    ...(formatoJson && { response_format: { type: "json_object" } }),
  });
  // Todos los equipos comparten límites: ante un 429, espera y reintenta.
  for (let intento = 0; ; intento++) {
    const res = await fetch(`${base()}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${HELMCODE_API_KEY}`,
        "content-type": "application/json",
      },
      body: cuerpo,
      signal,
    });
    if (res.status === 429 && intento < 3) {
      const espera = Number(res.headers.get("retry-after")) || 2 ** intento;
      await esperar(Math.min(espera, 10) * 1000, signal);
      continue;
    }
    if (!res.ok) throw new Error(`HelmCode respondió ${res.status}`);
    const data = await res.json();
    if (data.usage) alUso?.(data.usage);
    return data.choices[0].message.content;
  }
}
