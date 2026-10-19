import { completar } from "../../../lib/ia";

// Ejemplo: POST {"pregunta": "…"} devuelve {"respuesta": "…"}.
// Desde el navegador: fetch(ruta("/api/ia"), { method: "POST", body }).
export async function POST(req: Request) {
  const { pregunta } = await req.json().catch(() => ({}));
  if (
    typeof pregunta !== "string" ||
    !pregunta.trim() ||
    pregunta.length > 2000
  )
    return Response.json(
      { error: "Escribe una pregunta de hasta 2.000 caracteres." },
      { status: 400 },
    );
  const respuesta = await completar([
    {
      role: "system",
      content:
        "Responde en castellano llano. Si no lo sabes con una fuente oficial, dilo. Nunca pidas datos personales.",
    },
    { role: "user", content: pregunta },
  ]);
  return Response.json({ respuesta });
}
