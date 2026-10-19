import type { NextConfig } from "next";
import ficha from "./ficha.json";

// build.barraca.house sirve cada herramienta en /<equipo>. La app vive en esa
// ruta en todas partes, también en local, para que nada se rompa al juntarla.
const basePath = `/${ficha.equipo}`;

const config: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
