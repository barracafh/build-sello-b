import { defineConfig, devices } from "@playwright/test";
import ficha from "./ficha.json" with { type: "json" };

// Puerto propio para no chocar con `bun run dev` (3100-3199) ni con Multica (3000).
const puerto = Number(process.env.A11Y_PORT ?? 3290);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${puerto}/${ficha.equipo}/` },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  // Contra el build de producción: es lo que se publica y no recompila en cada test.
  webServer: {
    command: `bun run build && bunx next start --port ${puerto}`,
    url: `http://localhost:${puerto}/${ficha.equipo}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
