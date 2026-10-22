import type { NextConfig } from "next";
import ficha from "./ficha.json";

// build.barraca.house sirve cada herramienta en /<equipo>. La app vive en esa
// ruta en todas partes, también en local, para que nada se rompa al juntarla.
const basePath = `/${ficha.equipo}`;

// Next 16 solo deja pasar /_next y el websocket de HMR desde orígenes de
// localhost o de esta lista. Se permite el host del preview de Tailscale.
const base = process.env.PREVIEW_BASE_URL ?? "https://mac-mini.goby-arcturus.ts.net";
const hostPreview = URL.canParse(base) ? new URL(base).hostname : undefined;

const config: NextConfig = {
  basePath,
  allowedDevOrigins: hostPreview ? [hostPreview] : [],
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
