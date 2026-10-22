import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { elegirPuerto } from "../../scripts/puerto";

// Comprueba la accesibilidad (WCAG 2.2 AA) sobre el build de producción.
// `bun run a11y` construye primero; aquí solo se arranca `next start`.
const raiz = fileURLToPath(new URL("../../", import.meta.url));
const ficha = JSON.parse(readFileSync(`${raiz}ficha.json`, "utf8")) as { equipo: string };
// Los workers vuelven a cargar este fichero con el servidor ya escuchando: heredan
// el puerto por el entorno en vez de buscar otro libre.
process.env.A11Y_PORT ??= String(await elegirPuerto(raiz));
const puerto = Number(process.env.A11Y_PORT);
const base = `http://localhost:${puerto}/${ficha.equipo}`;

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `${base}/` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bunx next start -p ${puerto}`,
    cwd: raiz,
    url: base,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
