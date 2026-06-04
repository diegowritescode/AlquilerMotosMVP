import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, fillCustomerForm } from "./helpers/forms";
import { motorcycleData, customerData, isoDate } from "./helpers/test-data";
import { hasDbAccess } from "./helpers/env";

/**
 * Fase 2A.2 — uploads a Supabase Storage.
 *
 * En modo demo no hay Storage: validamos la PRESENCIA de los campos de subida y
 * los empty states. La subida real (Storage privado) solo corre cuando hay
 * acceso a Supabase (hasDbAccess) — si no, se omite.
 */
const PNG = "tests/fixtures/sample-image.png";

test.describe.serial("Uploads (fotos / documentos / evidencias)", () => {
  const moto = motorcycleData();
  const cust = customerData();
  let motoUrl = "";
  let custUrl = "";

  test("preparar moto y cliente", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    motoUrl = page.url();

    await page.goto("/app/customers/new");
    await fillCustomerForm(page, cust);
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.waitForURL(/\/app\/customers\/[0-9a-fA-F-]+$/);
    custUrl = page.url();
  });

  test("detalle de moto: sección de fotos con empty state y campo de subida", async ({ page }) => {
    await page.goto(motoUrl);
    await expect(page.getByText("Esta moto aún no tiene fotos registradas.")).toBeVisible();
    await expect(page.getByTestId("upload-motorcycle-photo")).toBeVisible();
  });

  test("detalle de cliente: sección de documentos con empty state y campo", async ({ page }) => {
    await page.goto(custUrl);
    await expect(
      page.getByText("Este arrendatario aún no tiene documentos cargados."),
    ).toBeVisible();
    await expect(page.getByTestId("upload-customer-document")).toBeVisible();
  });

  test("pago: comprobante con empty state y campo de subida", async ({ page }) => {
    const custId = custUrl.split("/").pop()!;
    await page.goto(`/app/payments/new?customer=${custId}`);
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Monto (COP)").fill("100000");
    await page.getByRole("button", { name: "Registrar pago" }).click();
    await page.waitForURL(/\/app\/payments\/[0-9a-fA-F-]+$/);

    await expect(page.getByText("Sin comprobante adjunto.")).toBeVisible();
    await expect(page.getByTestId("upload-payment-evidence")).toBeVisible();
  });

  test("multa: evidencia con empty state y campo de subida", async ({ page }) => {
    const motoId = motoUrl.split("/").pop()!;
    await page.goto(`/app/fines/new?motorcycle=${motoId}`);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel(/^Fecha/).fill(isoDate(0));
    await page.getByLabel("Valor (COP)").fill("322900");
    await page.getByLabel("Motivo").fill("E2E Multa evidencia");
    await page.getByRole("button", { name: "Registrar multa" }).click();
    await page.waitForURL(/\/app\/fines\/[0-9a-fA-F-]+$/);

    await expect(page.getByText("Sin evidencia adjunta.")).toBeVisible();
    await expect(page.getByTestId("upload-fine-evidence")).toBeVisible();
  });

  test("subir foto de moto a Supabase Storage", async ({ page }) => {
    test.skip(!hasDbAccess(), "Sin Storage en modo demo (requiere Supabase).");
    await page.goto(motoUrl);
    const form = page.getByTestId("upload-motorcycle-photo");
    await form.locator('input[type="file"]').setInputFiles(PNG);
    await form.getByRole("button", { name: "Subir foto" }).click();
    await expect(
      page.getByText("Archivo subido correctamente."),
    ).toBeVisible({ timeout: 20000 });
    // Tras refrescar, el empty state desaparece.
    await page.reload();
    await expect(
      page.getByText("Esta moto aún no tiene fotos registradas."),
    ).toHaveCount(0);
  });
});
