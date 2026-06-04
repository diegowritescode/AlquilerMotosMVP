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
});
