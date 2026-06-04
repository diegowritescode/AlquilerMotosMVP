import { test, expect } from "@playwright/test";
import { fillMotorcycleForm, expectRequiredBlocks } from "./helpers/forms";
import { motorcycleData } from "./helpers/test-data";
import { getTestDbClient } from "./helpers/supabase-admin";
import { hasDbAccess } from "./helpers/env";

test.describe.serial("Motocicletas", () => {
  const moto = motorcycleData();
  let detailUrl = "";

  test("listado de motos carga", async ({ page }) => {
    await page.goto("/app/motorcycles");
    await expect(page.getByRole("heading", { name: "Mis Motos" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Agregar/i })).toBeVisible();
  });

  test("crear moto E2E y redirige al detalle", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();

    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    detailUrl = page.url();
    await expect(
      page.getByRole("heading", { name: `${moto.brand} ${moto.model}` }),
    ).toBeVisible();
    await expect(page.getByText(`Placa ${moto.plate}`)).toBeVisible();
  });

  test("la moto aparece en el listado (búsqueda por placa)", async ({ page }) => {
    await page.goto("/app/motorcycles");
    await page.getByPlaceholder(/Buscar/i).fill(moto.plate);
    await expect(page.getByText(new RegExp(moto.plate))).toBeVisible();
  });

  test("editar la moto cambia un campo y persiste al refrescar", async ({ page }) => {
    await page.goto(`${detailUrl}/edit`);
    await page.getByLabel("Color").fill("Azul E2E");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL(detailUrl);

    await page.reload();
    await expect(page.getByText("Azul E2E")).toBeVisible();
  });

  test("validación: marca requerida bloquea el envío", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, motorcycleData());
    await page.getByLabel("Marca").fill("");
    await page.getByRole("button", { name: "Crear moto" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expectRequiredBlocks(page, "Marca");
  });

  test("validación: kilometraje negativo es rechazado (Zod)", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, motorcycleData({ mileage: "-5" }));
    await page.getByRole("button", { name: "Crear moto" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expect(page.getByText(/Revisa los campos marcados/i)).toBeVisible();
  });

  test("validación: año no razonable es rechazado (Zod)", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, motorcycleData({ year: "1800" }));
    await page.getByRole("button", { name: "Crear moto" }).click();
    await expect(page).toHaveURL(/\/new/);
    await expect(page.getByText(/Revisa los campos marcados/i)).toBeVisible();
  });

  test("la moto existe en Supabase (si hay acceso a DB)", async () => {
    test.skip(!hasDbAccess(), "Sin E2E_SUPABASE_SERVICE_ROLE_KEY (modo demo).");
    const db = getTestDbClient()!;
    const { data, error } = await db
      .from("motorcycles")
      .select("plate,color,current_status")
      .eq("plate", moto.plate)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.plate).toBe(moto.plate);
    expect(data?.color).toBe("Azul E2E"); // edición persistida
  });
});
