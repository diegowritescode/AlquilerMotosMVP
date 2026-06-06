import { test, expect } from "@playwright/test";
import { fillMotorcycleForm } from "./helpers/forms";
import { motorcycleData, isoDate } from "./helpers/test-data";

/**
 * Fase 2A.1 — mapa de fotomultas. No dependemos de que los tiles de
 * OpenStreetMap carguen: validamos el contenedor del mapa (data-testid), el
 * selector de ubicación y que las coordenadas se guarden (link OSM en detalle).
 */
test.describe.serial("Fotomultas — mapa y ubicación", () => {
  const moto = motorcycleData();
  let motoId = "";

  test("preparar moto E2E", async ({ page }) => {
    await page.goto("/app/motorcycles/new");
    await fillMotorcycleForm(page, moto);
    await page.getByRole("button", { name: "Crear moto" }).click();
    await page.waitForURL(/\/app\/motorcycles\/[0-9a-fA-F-]+$/);
    motoId = page.url().split("/").pop()!;
  });

  test("el formulario de multa muestra el selector de ubicación", async ({ page }) => {
    await page.goto(`/app/fines/new?motorcycle=${motoId}`);
    await expect(page.getByTestId("fine-location-picker")).toBeVisible();
    await expect(page.getByLabel("Latitud")).toBeVisible();
    await expect(page.getByLabel("Longitud")).toBeVisible();
  });

  test("registrar multa con coordenadas guarda la ubicación", async ({ page }) => {
    await page.goto(`/app/fines/new?motorcycle=${motoId}`);
    await page.getByLabel("Moto").selectOption(motoId);
    await page.getByLabel(/^Fecha/).fill(isoDate(0));
    await page.getByLabel("Valor (COP)").fill("322900");
    await page.getByLabel("Motivo").fill("E2E Multa con ubicación");
    await page.getByLabel("Latitud").fill("6.2086");
    await page.getByLabel("Longitud").fill("-75.566");
    await page.getByRole("button", { name: "Registrar multa" }).click();

    await page.waitForURL(/\/app\/fines\/[0-9a-fA-F-]+$/);
    await expect(page.getByText("E2E Multa con ubicación").first()).toBeVisible();
    // El detalle muestra el link a OpenStreetMap y el contenedor del mapa.
    await expect(
      page.getByRole("link", { name: /OpenStreetMap/i }),
    ).toBeVisible();
    await expect(page.getByTestId("fines-map")).toBeVisible();
  });

  test("la vista de mapa se renderiza en el listado", async ({ page }) => {
    await page.goto("/app/fines");
    await page.getByRole("button", { name: "Mapa" }).click();
    await expect(page).toHaveURL(/view=mapa/);
    // Contenedor del mapa presente (hay multas con coordenadas).
    await expect(page.getByTestId("fines-map")).toBeVisible();
  });

  test("filtrar por moto no rompe la lista", async ({ page }) => {
    await page.goto("/app/fines");
    await page.getByLabel("Filtrar por moto").selectOption(motoId);
    await expect(page).toHaveURL(/motorcycle=/);
    // La página sigue cargando sin overlay de error.
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Fotomultas/i }),
    ).toBeVisible();
  });

  // NOTA: estas pruebas son robustas a que la tabla traffic_cameras esté vacía
  // (p.ej. antes de aplicar la migración 0006). Validan que las vistas cargan
  // sin error; el render del mapa con marcadores requiere datos sembrados.
  test("la vista de Cámaras muestra el mapa de fotodetección con datos", async ({ page }) => {
    await page.goto("/app/fines");
    await page.getByRole("button", { name: "Cámaras" }).click();
    await expect(page).toHaveURL(/view=camaras/);
    await expect(page.getByText(/cámaras de fotomulta en Medellín/i)).toBeVisible();
    // Con la migración 0006 aplicada hay puntos sembrados -> el mapa renderiza.
    await expect(page.getByTestId("cameras-map")).toBeVisible();
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
  });

  test("el CRUD de cámaras lista y permite agregar", async ({ page }) => {
    await page.goto("/app/fines/cameras");
    await expect(page.getByRole("heading", { name: /Cámaras de fotomulta/i })).toBeVisible();
    await page.getByRole("link", { name: /Agregar cámara/i }).first().click();
    await page.waitForURL(/\/app\/fines\/cameras\/new$/);
    await expect(page.getByLabel(/Nombre \/ ubicación/i)).toBeVisible();
    await expect(page.getByLabel("Tipo")).toBeVisible();
  });

  test("el picker del formulario menciona las cámaras cercanas", async ({ page }) => {
    await page.goto(`/app/fines/new?motorcycle=${motoId}`);
    await expect(page.getByTestId("fine-location-picker")).toBeVisible();
    await expect(page.getByText(/cámara de fotomulta cercana/i)).toBeVisible();
  });
});
