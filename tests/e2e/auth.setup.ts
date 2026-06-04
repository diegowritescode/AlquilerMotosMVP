import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import { E2E } from "./helpers/env";

const authDir = "tests/e2e/.auth";
const authFile = `${authDir}/admin.json`;

/**
 * Logs in once (Supabase Auth in real mode, or the demo cookie in demo mode)
 * and persists the session for the rest of the suite.
 */
setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(E2E.adminEmail);
  await page.getByLabel("Contraseña").fill(E2E.adminPassword);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.waitForURL("**/app/dashboard", { timeout: 30_000 });
  await expect(page.getByText("Estado de la flota")).toBeVisible();

  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: authFile });
});
