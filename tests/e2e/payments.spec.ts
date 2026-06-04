import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, fillCustomerForm, expectRequiredBlocks } from "./helpers/forms";
import { motorcycleData, customerData, isoDate } from "./helpers/test-data";

/**
 * Pagos manuales. NOTA de diseño: el alquiler es OPCIONAL en el modelo (permite
 * abonos sin alquiler). Validamos: monto requerido y no negativo, arrendatario
 * requerido, y asociación correcta a cliente + alquiler. Ver docs/qa.md.
 */
test.describe.serial("Pagos manuales", () => {
  const moto = motorcycleData();
  const cust = customerData();
  let custId = "";

  test("preparar cliente, moto y alquiler", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    const motoId = page.url().split("/").pop()!;

    await page.goto("/app/customers/new");
    await fillCustomerForm(page, cust);
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.waitForURL(/\/app\/customers\/[0-9a-fA-F-]+$/);
    custId = page.url().split("/").pop()!;

    await page.goto("/app/rentals/new");
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Fecha de inicio").fill(isoDate(0));
    await page.getByLabel("Valor acordado (COP)").fill("150000");
    await page.getByLabel("Estado").selectOption("activo");
    await page.getByRole("button", { name: "Crear alquiler" }).click();
    await page.waitForURL(/\/app\/rentals\/[0-9a-fA-F-]+$/);
  });

  test("crear pago asocia automáticamente el alquiler activo del arrendatario", async ({ page }) => {
    await page.goto(`/app/payments/new?customer=${custId}`);
    await page.getByLabel("Arrendatario").selectOption(custId);
    // El alquiler activo se detecta solo: se muestra como "Alquiler asociado".
    await expect(page.getByText("Alquiler asociado")).toBeVisible();
    await page.getByLabel("Monto (COP)").fill("150000");
    await page.getByLabel("Método").selectOption("nequi");
    await page.getByLabel("Estado").selectOption("pendiente");
    await page.getByLabel("Fecha de vencimiento").fill(isoDate(3));
    await page.getByLabel("Referencia").fill("E2E-REF-001");
    await page.getByRole("button", { name: "Registrar pago" }).click();

    await page.waitForURL(/\/app\/payments\/[0-9a-fA-F-]+$/);
    await expect(page.getByText(cust.full_name).first()).toBeVisible();
    // Asociación al alquiler visible en el detalle.
    await expect(page.getByRole("link", { name: "Ver alquiler" })).toBeVisible();
  });

  test("el pago aparece en el listado y el filtro por estado funciona", async ({ page }) => {
    await page.goto("/app/payments");
    await expect(page.getByText(cust.full_name).first()).toBeVisible();

    await page.getByRole("button", { name: "Pendientes" }).click();
    await expect(page).toHaveURL(/status=pendiente/);
    await expect(page.getByText(cust.full_name).first()).toBeVisible();
  });

  test("validación: monto requerido bloquea el envío", async ({ page }) => {
    await page.goto(`/app/payments/new?customer=${custId}`);
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Monto (COP)").fill("");
    await page.getByRole("button", { name: "Registrar pago" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expectRequiredBlocks(page, "Monto (COP)");
  });

  test("validación: arrendatario requerido (Zod)", async ({ page }) => {
    await page.goto("/app/payments/new");
    await page.getByLabel("Arrendatario").selectOption("");
    await page.getByLabel("Monto (COP)").fill("50000");
    await page.getByRole("button", { name: "Registrar pago" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expect(page.getByText(/Revisa los campos marcados/i)).toBeVisible();
  });

  test("validación: monto negativo es rechazado (Zod)", async ({ page }) => {
    await page.goto(`/app/payments/new?customer=${custId}`);
    await page.getByLabel("Arrendatario").selectOption(custId);
    await page.getByLabel("Monto (COP)").fill("-100");
    await page.getByRole("button", { name: "Registrar pago" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expect(page.getByText(/Revisa los campos marcados/i)).toBeVisible();
  });
});
