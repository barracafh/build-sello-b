// Lista los modelos que sirve HelmCode: `bun scripts/modelos.ts`. Usa la misma
// URL base y la misma clave que `completar()` (src/lib/ia.ts) e imprime solo los
// ids, uno por línea. Nunca imprime la clave.
import { fileURLToPath } from "node:url";
import { base } from "../src/lib/ia";

export async function listarModelos(opciones: {
  clave: string;
  base?: string;
  fetch?: typeof fetch;
}): Promise<string[]> {
  const pedir = opciones.fetch ?? fetch;
  const res = await pedir(`${opciones.base ?? base()}/models`, {
    headers: { authorization: `Bearer ${opciones.clave}` },
  });
  if (!res.ok) throw new Error(`HelmCode respondió ${res.status}`);
  const datos = (await res.json()) as { data?: { id?: unknown }[] };
  return (datos.data ?? [])
    .map((m) => m.id)
    .filter((id): id is string => typeof id === "string")
    .sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const clave = process.env.HELMCODE_API_KEY;
  if (!clave) {
    console.error("Falta HELMCODE_API_KEY en .env.local");
    process.exit(2);
  }
  try {
    console.log((await listarModelos({ clave })).join("\n"));
  } catch (e) {
    console.error(`No se pudo listar los modelos: ${(e as Error).message}`);
    process.exit(1);
  }
}
