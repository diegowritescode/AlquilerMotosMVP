import { test, expect } from "@playwright/test";
import { fillMotorcycleForm } from "./helpers/forms";
import { motorcycleData } from "./helpers/test-data";
import { getTestDbClient } from "./helpers/supabase-admin";
import { hasDbAccess } from "./helpers/env";

test.describe.serial("Auditoría", () => {
  const moto = motorcycleData();
  let motoId = "";

  test("crear moto genera registro de auditoría", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    motoId = page.url().split("/").pop()!;

    if (hasDbAccess()) {
      const db = getTestDbClient()!;
      const { data } = await db
        .from("audit_logs")
        .select("action,entity_type")
        .eq("entity_id", motoId)
        .eq("entity_type", "motorcycle");
      expect((data ?? []).some((r: { action: string }) => r.action === "crear")).toBe(true);
    }
  });

  test("la pantalla de configuración/auditoría carga sin JSON roto", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.getByText("Auditoría reciente")).toBeVisible();
    await expect(page.getByText("Estado del backend")).toBeVisible();
    // Debe verse al menos una acción registrada (creamos una moto arriba).
    await expect(page.getByText(/Motorcycle/i).first()).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });
});
