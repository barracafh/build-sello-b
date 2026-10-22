// Preview en Tailscale: publica el puerto de este worktree con `tailscale serve`
// (solo tailnet, nunca funnel) y lo retira al salir. El 443 no se toca jamás.
import { spawnSync } from "node:child_process";

export type Ejecutar = (args: string[]) => { ok: boolean; stdout: string };

export const ejecutarTailscale: Ejecutar = (args) => {
  const r = spawnSync("tailscale", args, { encoding: "utf8", timeout: 10_000 });
  return { ok: !r.error && r.status === 0, stdout: r.stdout ?? "" };
};

const publicados = new Set<number>();

export function resolverBase(
  entorno: Record<string, string | undefined>,
  ejecutar: Ejecutar = ejecutarTailscale,
): string | null {
  const fijada = entorno.PREVIEW_BASE_URL?.trim().replace(/\/+$/, "");
  if (fijada) return fijada;
  const r = ejecutar(["status", "--json"]);
  if (!r.ok) return null;
  try {
    const dns = String(JSON.parse(r.stdout)?.Self?.DNSName ?? "").replace(/\.$/, "");
    return dns ? `https://${dns}` : null;
  } catch {
    return null;
  }
}

export const urlPreview = (base: string, puerto: number, equipo: string) =>
  `${base}:${puerto}/${equipo}`;

export function publicar(puerto: number, ejecutar: Ejecutar = ejecutarTailscale): boolean {
  if (puerto === 443) return false;
  const r = ejecutar(["serve", "--bg", `--https=${puerto}`, `http://127.0.0.1:${puerto}`]);
  if (r.ok) publicados.add(puerto);
  return r.ok;
}

// Idempotente: solo retira lo que este proceso publicó, y una sola vez.
export function retirar(puerto: number, ejecutar: Ejecutar = ejecutarTailscale): boolean {
  if (puerto === 443 || !publicados.delete(puerto)) return false;
  return ejecutar(["serve", `--https=${puerto}`, "off"]).ok;
}
