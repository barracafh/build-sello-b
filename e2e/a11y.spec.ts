import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import ejemplos from "../datos/mensajes-ejemplo.json" with { type: "json" };
import { NOMBRES_EJEMPLOS } from "../src/datos/ejemplos";

// WCAG 2.0, 2.1 y 2.2, niveles A y AA.
const NORMAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function sinViolaciones(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(NORMAS).analyze();
  expect(
    violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

// El panel de ejemplos solo sale con ?casos-test.
const CON_EJEMPLOS = "?casos-test";

const campo = (page: Page) =>
  page.getByRole("textbox", { name: "Pega aquí el mensaje que te ha llegado" });
const comprobar = (page: Page) =>
  page.getByRole("button", { name: /^(Comprobar el mensaje|Comprobando…)$/ });
const ejemplo = (page: Page, id: string) =>
  page.getByRole("button", { name: NOMBRES_EJEMPLOS[id], exact: true });
// Next añade su propio role="alert" vacío (route announcer): se filtra por texto.
const alerta = (page: Page, texto: string) =>
  page.getByRole("alert").filter({ hasText: texto });
const estado = (page: Page, texto: RegExp) =>
  page.getByRole("status").filter({ hasText: texto });

const ETIQUETAS = {
  oficial_verificado: "Web oficial",
  no_oficial: "No es oficial",
  no_determinable: "No podemos confirmarlo",
} as const;

// La respuesta de /api/verificar se retiene hasta llamar a la función devuelta.
async function retenerVerificacion(page: Page) {
  let soltar = () => {};
  const retenida = new Promise<void>((r) => (soltar = r));
  await page.route("**/api/verificar", async (route) => {
    await retenida;
    await route.continue();
  });
  return soltar;
}

test("formulario vacío", async ({ page }) => {
  await page.goto("");
  await sinViolaciones(page);
});

test("formulario vacío con ejemplos", async ({ page }) => {
  await page.goto(CON_EJEMPLOS);
  await expect(ejemplo(page, "F01")).toBeVisible();
  await sinViolaciones(page);
});

test("error de validación", async ({ page }) => {
  await page.goto("");
  await comprobar(page).click();
  await expect(alerta(page, "Escribe o pega un mensaje")).toBeVisible();
  await expect(campo(page)).toHaveAttribute("aria-invalid", "true");
  await sinViolaciones(page);
});

test("cargar un ejemplo se anuncia", async ({ page }) => {
  await page.goto(CON_EJEMPLOS);
  await ejemplo(page, "F02").click();
  await expect(estado(page, /Ejemplo cargado: Multa de la DGT/)).toBeAttached();
});

test("cargando: el foco no se pierde y se anuncia", async ({ page }) => {
  const soltar = await retenerVerificacion(page);
  await page.goto(CON_EJEMPLOS);
  await ejemplo(page, "F01").click();
  await comprobar(page).focus();
  await page.keyboard.press("Enter");
  await expect(estado(page, /Comprobando el mensaje/)).toBeAttached();
  await expect(comprobar(page)).toHaveAttribute("aria-disabled", "true");
  await expect(comprobar(page)).toBeFocused();
  await sinViolaciones(page);
  soltar();
});

test("error de red", async ({ page }) => {
  await page.route("**/api/verificar", (route) => route.abort());
  await page.goto(CON_EJEMPLOS);
  await ejemplo(page, "F01").click();
  await comprobar(page).click();
  await expect(alerta(page, "No hemos podido comprobarlo")).toBeVisible();
  await sinViolaciones(page);
});

// Un caso de datos/mensajes-ejemplo.json por veredicto.
for (const veredicto of ["oficial_verificado", "no_oficial", "no_determinable"] as const) {
  const caso = ejemplos.find((e) => e.esperado === veredicto)!;
  test(`resultado ${veredicto} (${caso.id})`, async ({ page }) => {
    await page.goto(CON_EJEMPLOS);
    await ejemplo(page, caso.id).click();
    await expect(campo(page)).not.toHaveValue("");
    await comprobar(page).click();
    // El foco va al titular del resultado, que lleva la etiqueta del veredicto.
    const titular = page.getByRole("heading", { level: 2, name: new RegExp(`^${ETIQUETAS[veredicto]} \\.`) });
    await expect(titular).toBeFocused();
    await sinViolaciones(page);
  });
}

test("sin scroll horizontal a 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(CON_EJEMPLOS);
  await ejemplo(page, "L05").click();
  await comprobar(page).click();
  await expect(page.getByRole("heading", { level: 2, name: /^Web oficial \./ })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test("página 404 en español, con <main> y enlace de vuelta", async ({ page }) => {
  const res = await page.goto("no-existe");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "No encontramos esta página" })).toBeVisible();
  // El enlace «Saltar al contenido» del layout tiene que llevar a algún sitio.
  await expect(page.locator("main#contenido")).toBeVisible();
  await page.getByRole("link", { name: "Volver al verificador" }).click();
  await expect(campo(page)).toBeVisible();
  await page.goto("no-existe");
  await sinViolaciones(page);
});
