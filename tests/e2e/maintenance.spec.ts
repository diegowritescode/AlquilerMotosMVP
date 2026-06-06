import { test, expect } from "@playwright/test";
import { fillMotorcycleForm } from "./helpers/forms";
import { motorcycleData, isoDate } from "./helpers/test-data";

test.describe.serial("Mantenimientos", () => {
  const moto = motorcycleData();
  let motoId = "";

  test("preparar moto E2E", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    motoId = page.url().split("/").pop()!;
  });

  test("crear mantenimiento asociado a la moto", async ({ page }) => {
    await page.goto(`/app/maintenance/new?motorcycle=${motoId}`);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel("Tipo").selectOption("cambio_aceite");
    await page.getByLabel(/^Fecha/).fill(isoDate(-1));
    await page.getByLabel("Estado").selectOption("programado");
    await page.getByLabel(/^Kilometraje/).fill("16000");
    await page.getByLabel("Costo (COP)").fill("45000");
    await page.getByLabel("Próxima fecha").fill(isoDate(5));
    await page.getByLabel("Próximo kilometraje").fill("19000");
    await page.getByRole("button", { name: "Registrar mantenimiento" }).click();

    await page.waitForURL("**/app/maintenance");
    await expect(
      page.getByText(`${moto.brand} ${moto.model}`).first(),
    ).toBeVisible();
  });

  test("aparece en el historial del detalle de la moto", async ({ page }) => {
    await page.goto(`/app/motorcycles/${motoId}`);
    await expect(
      page.getByRole("heading", { name: "Mantenimientos" }),
    ).toBeVisible();
    await expect(page.getByText("Cambio de aceite").first()).toBeVisible();
  });

  test("el próximo mantenimiento aparece en vencimientos", async ({ page }) => {
    await page.goto("/app/expirations");
    await expect(page.getByText(new RegExp(moto.plate)).first()).toBeVisible();
  });

  test("marcar 'realizado' con el selector rápido (detalle de moto)", async ({ page }) => {
    await page.goto(`/app/motorcycles/${motoId}`);
    const select = page.getByLabel("Cambiar estado del mantenimiento").first();
    await expect(select).toHaveValue("programado");
    await select.selectOption("realizado");
    await expect(select).toBeEnabled(); // terminó el guardado
    await page.reload();
    await expect(
      page.getByLabel("Cambiar estado del mantenimiento").first(),
    ).toHaveValue("realizado");
  });

  test("editar mantenimiento en la página que faltaba (costo persiste)", async ({ page }) => {
    await page.goto(`/app/motorcycles/${motoId}`);
    // Localizador inequívoco: el link de la tarjeta de mantenimiento apunta a
    // /app/maintenance/<id>/edit (evita el "Cambio de aceite" de vencimientos).
    // La navegación es client-side (<Link>): usar toHaveURL (polling).
    await page.locator('a[href*="/app/maintenance/"][href$="/edit"]').first().click();
    await expect(page).toHaveURL(/\/app\/maintenance\/[0-9a-fA-F-]+\/edit$/);
    const editUrl = page.url();
    await expect(page.getByRole("heading", { name: "Editar mantenimiento" })).toBeVisible();
    // Sanity: el form viene prellenado (la moto del registro está seleccionada).
    await expect(page.getByLabel("Moto")).not.toHaveValue("");
    await page.getByLabel("Costo (COP)").fill("99000");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/\/app\/maintenance$/);
    // Reabrir el mismo registro y confirmar persistencia.
    await page.goto(editUrl);
    await expect(page.getByLabel("Costo (COP)")).toHaveValue("99000");
  });
});
