import { test, expect } from "@playwright/test";

/**
 * Fase 2A.4 — configuración del negocio + exportaciones.
 * Funciona en demo (settings se guarda en memoria; exports leen el store).
 */
test.describe("Configuración del negocio", () => {
  test("la página de configuración carga y permite editar", async ({ page }) => {
    await page.goto("/app/settings/business");
    await expect(
      page.getByRole("heading", { name: "Configuración del negocio" }),
    ).toBeVisible();

    const name = `Moto Rental ${Date.now().toString().slice(-5)}`;
    await page.getByLabel("Nombre del negocio").fill(name);
    await page.getByLabel("WhatsApp").fill("573009998877");
    await page.getByRole("button", { name: "Guardar configuración" }).click();

    await expect(page.getByText("Configuración guardada.")).toBeVisible();
    // Persiste al refrescar.
    await page.reload();
    await expect(page.getByLabel("Nombre del negocio")).toHaveValue(name);
  });

  test("validación: nombre del negocio requerido", async ({ page }) => {
    await page.goto("/app/settings/business");
    await page.getByLabel("Nombre del negocio").fill("");
    await page.getByRole("button", { name: "Guardar configuración" }).click();
    await expect(page).toHaveURL(/\/settings\/business/);
  });
});

test.describe("Exportaciones", () => {
  test("reportes muestra la tarjeta y botones de exportación", async ({ page }) => {
    await page.goto("/app/reports");
    await expect(page.getByText("Exportar información")).toBeVisible();
    // Por href para no chocar con los enlaces del sidebar (mismos nombres).
    for (const type of [
      "motos",
      "arrendatarios",
      "alquileres",
      "pagos",
      "fotomultas",
      "mantenimientos",
    ]) {
      await expect(page.locator(`a[href="/app/exports/${type}"]`)).toBeVisible();
    }
  });

  test("descargar CSV de motos responde 200 con cabeceras correctas", async ({ page }) => {
    const res = await page.request.get("/app/exports/motos");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");
    expect(res.headers()["content-disposition"]).toContain("motos-");
    const body = await res.text();
    // Encabezado de la primera columna presente.
    expect(body).toContain("placa");
  });

  test("tipo de exportación inválido responde 400", async ({ page }) => {
    const res = await page.request.get("/app/exports/desconocido");
    expect(res.status()).toBe(400);
  });
});
