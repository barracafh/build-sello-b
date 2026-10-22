import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ETIQUETAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Falla con la lista de reglas incumplidas y sus selectores.
async function sinViolaciones(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(ETIQUETAS).analyze();
  const resumen = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(resumen).toEqual([]);
}

// El nombre accesible empieza por el código visible: «F01: SMS de …».
const ejemplo = (page: Page, caso: string) =>
  page.getByRole("button", { name: new RegExp(`^${caso}:`) });

async function comprobar(page: Page, caso: string) {
  await ejemplo(page, caso).click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByRole("heading", { level: 2 }).last()).toBeFocused();
}

test.describe("inicio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("estado inicial", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await sinViolaciones(page);
  });

  for (const [caso, veredicto] of [
    ["F01", "no_oficial"],
    ["L01", "no_determinable"],
    ["L05", "oficial_verificado"],
  ]) {
    test(`resultado ${veredicto} (${caso})`, async ({ page }) => {
      await comprobar(page, caso);
      await expect(page.getByText(veredicto, { exact: true })).toBeVisible();
      await sinViolaciones(page);
    });
  }

  test("error de validación", async ({ page }) => {
    await page.getByRole("button", { name: "Comprobar" }).click();
    const campo = page.getByRole("textbox", { name: /Pega aquí/ });
    await expect(campo).toHaveAttribute("aria-invalid", "true");
    await expect(campo).toBeFocused();
    await expect(page.getByRole("alert").filter({ hasText: "Escribe o pega" })).toBeVisible();
    await sinViolaciones(page);
  });

  test("error de red", async ({ page }) => {
    await page.route("**/api/verificar", (ruta) => ruta.abort());
    await ejemplo(page, "F01").click();
    const boton = page.getByRole("button", { name: "Comprobar" });
    await boton.click();
    await expect(page.getByRole("alert").filter({ hasText: "No hemos podido comprobarlo" })).toBeVisible();
    await expect(boton).toBeFocused();
    await sinViolaciones(page);
  });

  test("anuncia que está comprobando", async ({ page }) => {
    let soltar = () => {};
    const espera = new Promise<void>((r) => (soltar = r));
    await page.route("**/api/verificar", async (ruta) => {
      await espera;
      await ruta.continue();
    });
    await ejemplo(page, "F01").click();
    await expect(page.getByRole("status")).toContainText("Ejemplo F01 cargado");
    const boton = page.getByRole("button", { name: "Comprobar" });
    await boton.click();
    await expect(page.getByRole("status")).toContainText("Comprobando");
    await expect(boton).toBeFocused();
    await sinViolaciones(page);
    soltar();
    await expect(page.getByRole("status")).not.toContainText("Comprobando");
  });

  test("teclado: el primer Tab llega al enlace de salto y lleva al contenido", async ({ page }) => {
    await page.keyboard.press("Tab");
    const salto = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(salto).toBeFocused();
    await expect(salto).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenido")).toBeFocused();
  });

  test("teclado: el foco se ve con un contorno", async ({ page }) => {
    await page.getByRole("textbox", { name: /Pega aquí/ }).focus();
    await page.keyboard.press("Tab");
    const boton = page.getByRole("button", { name: "Comprobar" });
    await expect(boton).toBeFocused();
    await expect(boton).toHaveCSS("outline-style", "solid");
    await expect(boton).toHaveCSS("outline-width", "2px");
  });

  test("320 px sin scroll horizontal y sin violaciones", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await comprobar(page, "L05");
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(320);
    await sinViolaciones(page);
  });
});

test("página no encontrada", async ({ page }) => {
  const res = await page.goto("./no-existe");
  expect(res?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await sinViolaciones(page);
});
