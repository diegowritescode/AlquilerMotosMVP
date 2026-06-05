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

  test("la página /offline carga con mensaje y acción Reintentar", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByText(/Sin conexión a internet/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Reintentar/i })).toBeVisible();
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
    await expect(page.getByText(/Hola, Will/i)).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });

  test("el toggle de tema cambia entre claro y oscuro y persiste", async ({ page }) => {
    await page.goto("/app/dashboard");
    const html = page.locator("html");
    // Por defecto, oscuro.
    await expect(html).toHaveClass(/dark/);

    const toggle = page.getByRole("button", { name: /Cambiar a modo claro/i });
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);

    // Persiste tras recargar.
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // Volver a oscuro.
    await page.getByRole("button", { name: /Cambiar a modo oscuro/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
