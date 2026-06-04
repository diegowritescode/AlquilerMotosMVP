import { test, expect } from "@playwright/test";

test.describe("Vencimientos y reportes", () => {
  test("/app/expirations carga sin errores", async ({ page }) => {
    await page.goto("/app/expirations");
    await expect(
      page.getByRole("heading", { name: /Vencimientos y alertas/i }),
    ).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);

    // Hay datos semilla con vencidos/próximos: debe verse al menos un grupo o
    // el estado vacío "Todo al día".
    const groups = page.getByText(
      /Vencidos|Próximos 7 días|Próximos 15 días|Próximos 30 días|Todo al día/,
    );
    await expect(groups.first()).toBeVisible();
  });

  test("/app/reports carga y muestra métricas básicas", async ({ page }) => {
    await page.goto("/app/reports");
    await expect(page.getByRole("heading", { name: "Reportes" })).toBeVisible();
    await expect(page.getByText("Ingresos totales")).toBeVisible();
    await expect(page.getByText(/Utilización de flota/)).toBeVisible();
    await expect(page.getByText("Motos por estado")).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });
});
