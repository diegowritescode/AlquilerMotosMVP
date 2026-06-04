import { test, expect } from "@playwright/test";

test.describe("Landing pública", () => {
  test("carga el hero y secciones principales", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Alquila, controla y mantén/i }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "¿Por qué nosotros?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nuestras motos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Requisitos" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Preguntas frecuentes" }),
    ).toBeVisible();
  });

  test("muestra CTA de WhatsApp con enlace wa.me", async ({ page }) => {
    await page.goto("/");
    const wa = page.locator('a[href*="wa.me"]').first();
    await expect(wa).toBeVisible();
  });

  test("enlaces a /privacy y /terms funcionan", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: /tratamiento de datos personales/i }),
    ).toBeVisible();

    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: /Términos y condiciones/i }),
    ).toBeVisible();
  });
});
