import { createHash } from "node:crypto";
import { createServer } from "node:net";

// Rango para los servidores de desarrollo. El 3000 lo ocupa el frontend de
// Multica en el Mac mini, así que cada worktree vive en 3100-3199.
const PRIMERO = 3100;
const TOTAL = 100;

// Puerto fijo para cada worktree: sale de su ruta, así que no cambia entre arranques.
export function puertoEstable(rutaWorktree: string): number {
  const hash = createHash("sha256").update(rutaWorktree).digest();
  return PRIMERO + (hash.readUInt32BE(0) % TOTAL);
}

function escucha(puerto: number, host?: string): Promise<boolean> {
  return new Promise((resolver) => {
    const servidor = createServer();
    servidor.once("error", () => resolver(false));
    servidor.listen({ port: puerto, host, exclusive: true }, () =>
      servidor.close(() => resolver(true)),
    );
  });
}

// next dev escucha en todas las interfaces; otro proceso puede tener el puerto
// solo en 127.0.0.1, así que se comprueban las dos.
async function libre(puerto: number): Promise<boolean> {
  return (await escucha(puerto, "127.0.0.1")) && (await escucha(puerto));
}

// PORT manda. Si no, el puerto estable del worktree o, si está ocupado, el
// siguiente libre del rango.
export async function elegirPuerto(
  rutaWorktree: string,
  entorno: Record<string, string | undefined> = process.env,
): Promise<number> {
  if (entorno.PORT) return Number(entorno.PORT);
  const inicio = puertoEstable(rutaWorktree) - PRIMERO;
  for (let i = 0; i < TOTAL; i++) {
    const puerto = PRIMERO + ((inicio + i) % TOTAL);
    if (await libre(puerto)) return puerto;
  }
  throw new Error(`No hay ningún puerto libre entre ${PRIMERO} y ${PRIMERO + TOTAL - 1}. Usa PORT=<puerto>.`);
}
