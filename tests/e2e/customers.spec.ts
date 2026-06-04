import { test, expect } from "@playwright/test";
import { fillCustomerForm, expectRequiredBlocks } from "./helpers/forms";
import { customerData } from "./helpers/test-data";
import { getTestDbClient } from "./helpers/supabase-admin";
import { hasDbAccess } from "./helpers/env";

test.describe.serial("Arrendatarios / clientes", () => {
  const cust = customerData();
  let detailUrl = "";

  test("listado de clientes carga", async ({ page }) => {
    await page.goto("/app/customers");
    await expect(page.getByRole("heading", { name: "Arrendatarios" })).toBeVisible();
  });

  test("crear cliente E2E y redirige al detalle", async ({ page }) => {
    await page.goto("/app/customers/new");
    // El formulario de creación incluye el campo de foto de la licencia.
    await expect(page.getByLabel(/Foto de la licencia/i)).toBeVisible();
    await fillCustomerForm(page, cust);
    await page.getByRole("button", { name: "Crear cliente" }).click();

    await page.waitForURL(/\/app\/customers\/[0-9a-fA-F-]+$/);
    detailUrl = page.url();
    await expect(page.getByRole("heading", { name: cust.full_name })).toBeVisible();
  });

  test("botón de WhatsApp visible en el detalle", async ({ page }) => {
    await page.goto(detailUrl);
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
  });

  test("aparece en el listado (búsqueda por documento)", async ({ page }) => {
    await page.goto("/app/customers");
    await page.getByPlaceholder(/Buscar/i).fill(cust.document_number);
    await expect(page.getByText(cust.full_name)).toBeVisible();
  });

  test("editar teléfono y dirección persiste al refrescar", async ({ page }) => {
    await page.goto(`${detailUrl}/edit`);
    await page.getByLabel("Teléfono").fill("3009998877");
    await page.getByLabel("Dirección").fill("Calle E2E 123");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL(detailUrl);

    await page.reload();
    await expect(page.getByText("3009998877")).toBeVisible();
    await expect(page.getByText("Calle E2E 123")).toBeVisible();
  });

  test("validación: nombre requerido bloquea el envío", async ({ page }) => {
    await page.goto("/app/customers/new");
    await fillCustomerForm(page, customerData());
    await page.getByLabel("Nombre completo").fill("");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expectRequiredBlocks(page, "Nombre completo");
  });

  test("el cliente existe en Supabase (si hay acceso a DB)", async () => {
    test.skip(!hasDbAccess(), "Sin E2E_SUPABASE_SERVICE_ROLE_KEY (modo demo).");
    const db = getTestDbClient()!;
    const { data, error } = await db
      .from("customers")
      .select("document_number,phone")
      .eq("document_number", cust.document_number)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.phone).toBe("3009998877");
  });
});
