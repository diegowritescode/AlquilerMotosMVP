import { test, expect } from "@playwright/test";
import { E2E, isSupabaseMode } from "./helpers/env";

test.describe("Auth y protección de rutas", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("/app/dashboard sin sesión redirige a /login", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("login demo está deshabilitado en modo Supabase", async ({ page }) => {
    test.skip(
      !isSupabaseMode(),
      "Solo aplica con Supabase configurado (ALLOW_DEMO_LOGIN=false).",
    );

    await page.goto("/login");
    await page.getByLabel("Correo").fill("admin@motorental.co");
    await page.getByLabel("Contraseña").fill("demo1234");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("login válido entra al dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill(E2E.authEmail);
    await page.getByLabel("Contraseña").fill(E2E.authPassword);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await page.waitForURL("**/app/dashboard");
    await expect(page.getByText(/Hola, Propietario/i)).toBeVisible();
  });

  test("logout vuelve a /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill(E2E.authEmail);
    await page.getByLabel("Contraseña").fill(E2E.authPassword);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await page.waitForURL("**/app/dashboard");

    await page.getByRole("button", { name: /Salir/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });
});