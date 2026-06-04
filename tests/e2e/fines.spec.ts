import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, fillCustomerForm } from "./helpers/forms";
import { motorcycleData, customerData, isoDate } from "./helpers/test-data";

/**
 * Fotomultas manuales. Sin SIMIT/RUNT ni scraping. Verifica el registro y la
 * sugerencia de responsable según el alquiler activo en la fecha.
 */
test.describe.serial("Fotomultas / infracciones", () => {
  const moto = motorcycleData();
  const cust = customerData();
  let motoId = "";
  let custId = "";

  test("preparar moto, cliente y alquiler activo", async ({ page }) => {
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

    await page.goto("/app/rentals/new");
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Fecha de inicio").fill(isoDate(-2));
    await page.getByLabel("Valor acordado (COP)").fill("150000");
    await page.getByLabel("Estado").selectOption("activo");
    await page.getByRole("button", { name: "Crear alquiler" }).click();
    await page.waitForURL(/\/app\/rentals\/[0-9a-fA-F-]+$/);
  });

  test("registrar multa y sugerir responsable por alquiler activo", async ({ page }) => {
    await page.goto(`/app/fines/new?motorcycle=${motoId}`);
    await page.getByLabel("Moto").selectOption(motoId);
    // Dejar "Arrendatario responsable" en "Sugerir automáticamente".
    await page.getByLabel(/^Fecha/).fill(isoDate(0));
    await page.getByLabel("Valor (COP)").fill("322900");
    await page.getByLabel("Motivo").fill("E2E Exceso de velocidad");
    await page.getByLabel("Ubicación").fill("Cl. 30 con Cra. 65");
    await page.getByLabel("Estado").selectOption("pendiente");
    await page.getByRole("button", { name: "Registrar multa" }).click();

    await page.waitForURL(/\/app\/fines\/[0-9a-fA-F-]+$/);
    await expect(page.getByText("E2E Exceso de velocidad").first()).toBeVisible();
    // Responsable sugerido automáticamente desde el alquiler activo.
    await expect(page.getByText(cust.full_name).first()).toBeVisible();
  });

  test("la multa aparece en el listado", async ({ page }) => {
    await page.goto("/app/fines");
    await expect(page.getByText("E2E Exceso de velocidad").first()).toBeVisible();
  });

  test("la multa aparece en el detalle de la moto", async ({ page }) => {
    await page.goto(`/app/motorcycles/${motoId}`);
    await expect(page.getByText(/Fotomultas/i).first()).toBeVisible();
    await expect(page.getByText("E2E Exceso de velocidad").first()).toBeVisible();
  });
});
