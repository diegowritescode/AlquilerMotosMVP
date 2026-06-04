import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, fillCustomerForm } from "./helpers/forms";
import { motorcycleData, customerData, isoDate } from "./helpers/test-data";
import { getTestDbClient } from "./helpers/supabase-admin";
import { hasDbAccess } from "./helpers/env";

/**
 * Flujo crítico de alquileres y reglas de negocio:
 *  - alquiler activo -> moto "alquilada"
 *  - no dos alquileres activos por moto
 *  - finalizar -> moto disponible/mantenimiento
 */
test.describe.serial("Alquileres", () => {
  const moto = motorcycleData();
  const cust = customerData();
  let motoId = "";
  let custId = "";
  let rentalUrl = "";

  test("preparar moto disponible y cliente E2E", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    motoId = page.url().split("/").pop()!;

    await page.goto("/app/customers/new");
    await fillCustomerForm(page, cust);
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.waitForURL(/\/app\/customers\/[0-9a-fA-F-]+$/);
    custId = page.url().split("/").pop()!;
  });

  test("crear alquiler activo y ver moto + cliente en detalle", async ({ page }) => {
    await page.goto("/app/rentals/new");
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Fecha de inicio").fill(isoDate(0));
    await page.getByLabel("Valor acordado (COP)").fill("150000");
    await page.getByLabel("Estado").selectOption("activo");
    await page.getByRole("button", { name: "Crear alquiler" }).click();

    await page.waitForURL(/\/app\/rentals\/[0-9a-fA-F-]+$/);
    rentalUrl = page.url();
    await expect(page.getByText(cust.full_name).first()).toBeVisible();
    await expect(page.getByText(`${moto.brand} ${moto.model}`).first()).toBeVisible();
  });

  test("la moto cambió a 'alquilada'", async ({ page }) => {
    await page.goto(`/app/motorcycles/${motoId}`);
    await expect(page.getByText("Alquilada").first()).toBeVisible();

    if (hasDbAccess()) {
      const db = getTestDbClient()!;
      const { data } = await db
        .from("motorcycles")
        .select("current_status")
        .eq("id", motoId)
        .maybeSingle();
      expect(data?.current_status).toBe("alquilada");
    }
  });

  test("no permite un segundo alquiler activo para la misma moto", async ({ page }) => {
    await page.goto(`/app/rentals/new?motorcycle=${motoId}&customer=${custId}`);
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Fecha de inicio").fill(isoDate(0));
    await page.getByLabel("Valor acordado (COP)").fill("150000");
    await page.getByLabel("Estado").selectOption("activo");
    await page.getByRole("button", { name: "Crear alquiler" }).click();

    await expect(page.getByText(/ya tiene un alquiler activo/i)).toBeVisible();
    await expect(page).toHaveURL(/\/new/);
  });

  test("finalizar el alquiler deja la moto en mantenimiento", async ({ page }) => {
    await page.goto(rentalUrl);
    await page
      .locator('select[name="next_motorcycle_status"]')
      .selectOption("mantenimiento");
    await page.getByRole("button", { name: "Finalizar" }).click();
    await page.waitForURL(rentalUrl);

    await expect(page.getByText("Finalizado").first()).toBeVisible();

    await page.goto(`/app/motorcycles/${motoId}`);
    await expect(page.getByText("Mantenimiento").first()).toBeVisible();

    if (hasDbAccess()) {
      const db = getTestDbClient()!;
      const { data } = await db
        .from("motorcycles")
        .select("current_status")
        .eq("id", motoId)
        .maybeSingle();
      expect(data?.current_status).toBe("mantenimiento");
    }
  });
});
