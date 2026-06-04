import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("carga autenticado y muestra tarjetas principales", async ({ page }) => {
    await page.goto("/app/dashboard");

    await expect(page.getByText(/Resumen general/i)).toBeVisible();

    // Stat cards / fleet section.
    await expect(page.getByText("Total de motos")).toBeVisible();
    await expect(page.getByText("Alquiladas").first()).toBeVisible();
    await expect(page.getByText(/Ingresos \(mes\)/)).toBeVisible();
    await expect(page.getByText("Estado de la flota")).toBeVisible();
    await expect(page.getByText("Disponibles")).toBeVisible();
    await expect(page.getByText("Mantenimiento").first()).toBeVisible();
    await expect(page.getByText("Pagos pendientes").first()).toBeVisible();
    await expect(page.getByText("Próximos vencimientos")).toBeVisible();
  });

  test("no muestra el overlay de error de Next", async ({ page }) => {
    await page.goto("/app/dashboard");
    // Next.js dev error overlay uses this portal id; it must be absent.
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });
});
