import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, fillCustomerForm } from "./helpers/forms";
import { motorcycleData, customerData, isoDate } from "./helpers/test-data";
import { hasDbAccess } from "./helpers/env";

/**
 * Fase 2A.3 — acta PDF + evidencia de entrega/devolución del alquiler.
 * En demo no hay Storage: validamos presencia de secciones, botones y empty
 * states. La generación real del acta y la subida se prueban solo con Supabase.
 */
const PNG = "tests/fixtures/sample-image.png";

test.describe.serial("Alquiler — acta y evidencias", () => {
  const moto = motorcycleData();
  const cust = customerData();
  let rentalUrl = "";

  test("preparar moto, cliente y alquiler", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    const motoId = page.url().split("/").pop()!;

    await page.goto("/app/customers/new");
    await fillCustomerForm(page, cust);
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.waitForURL(/\/app\/customers\/[0-9a-fA-F-]+$/);
    const custId = page.url().split("/").pop()!;

    await page.goto("/app/rentals/new");
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Fecha de inicio").fill(isoDate(0));
    await page.getByLabel("Valor acordado (COP)").fill("150000");
    await page.getByLabel("Estado").selectOption("activo");
    await page.getByRole("button", { name: "Crear alquiler" }).click();
    await page.waitForURL(/\/app\/rentals\/[0-9a-fA-F-]+$/);
    rentalUrl = page.url();
  });

  test("secciones de acta y evidencias presentes con empty states", async ({ page }) => {
    await page.goto(rentalUrl);

    await expect(page.getByRole("heading", { name: "Acta del alquiler" })).toBeVisible();
    await expect(page.getByTestId("rental-contract")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generar acta PDF" })).toBeVisible();
    await expect(page.getByText("Sin acta generada.")).toBeVisible();

    await expect(
      page.getByText("Aún no hay evidencia de entrega registrada."),
    ).toBeVisible();
    await expect(page.getByTestId("upload-rental-delivery")).toBeVisible();

    await expect(
      page.getByText("Aún no hay evidencia de devolución registrada."),
    ).toBeVisible();
    await expect(page.getByTestId("upload-rental-return")).toBeVisible();
  });

  test("generar acta PDF (solo con Supabase)", async ({ page }) => {
    test.skip(!hasDbAccess(), "Sin Storage en modo demo (requiere Supabase).");
    await page.goto(rentalUrl);
    await page.getByRole("button", { name: "Generar acta PDF" }).click();
    await expect(page.getByText("Acta generada correctamente.")).toBeVisible({
      timeout: 20000,
    });
    await page.reload();
    await expect(page.getByTestId("rental-contract-link")).toBeVisible();
  });

  test("subir evidencia de entrega (solo con Supabase)", async ({ page }) => {
    test.skip(!hasDbAccess(), "Sin Storage en modo demo (requiere Supabase).");
    await page.goto(rentalUrl);
    const form = page.getByTestId("upload-rental-delivery");
    await form.locator('input[type="file"]').setInputFiles(PNG);
    await form.getByRole("button", { name: "Subir evidencia de entrega" }).click();
    await expect(page.getByText("Archivo subido correctamente.")).toBeVisible({
      timeout: 20000,
    });
  });
});
