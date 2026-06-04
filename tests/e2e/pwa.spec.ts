import { test, expect } from "@playwright/test";

/**
 * Fase 2A.5 — PWA. No probamos beforeinstallprompt (inestable en headless),
 * solo lo verificable de forma robusta: manifest, página offline y que el
 * dashboard no se rompa por el InstallAppPrompt (oculto por defecto).
 */
test.describe("PWA", () => {
  test("/manifest.webmanifest responde con JSON válido", async ({ page }) => {
    const res = await page.request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const body = JSON.parse(await res.text());
    expect(body.name).toBeTruthy();
    expect(body.display).toBe("standalone");
    expect(body.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("la página /offline carga con mensaje y botón Reintentar", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByText(/Sin conexión a internet/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Reintentar/i })).toBeVisible();
  });

  test("los íconos PWA se sirven", async ({ page }) => {
    for (const icon of [
      "/icons/icon-192x192.png",
      "/icons/icon-512x512.png",
      "/icons/maskable-512x512.png",
    ]) {
      const res = await page.request.get(icon);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
  });

  test("el dashboard carga sin romperse por el install prompt", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page.getByText(/Hola, Propietario/i)).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });
});
