import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load test env. .env.local first (real secrets, gitignored), then .env.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

/**
 * E2E config for Moto Rental.
 *
 * The suite runs against a running app. If Supabase env is present the app uses
 * Postgres (real persistence); otherwise it runs in DEMO mode (in-memory store)
 * and the suite still validates forms/flows/navigation. DB-assertion and
 * Supabase-only tests skip themselves when no test DB client is available
 * (see tests/e2e/helpers).
 *
 * Default port is 3100 to avoid clashing with another app on 3000. Override the
 * whole URL with E2E_BASE_URL.
 */
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3100";
const port = Number(new URL(baseURL).port || "3100");

export default defineConfig({
  testDir: "./tests/e2e",
  // Run serially: tests share one app process and create/clean DB rows.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalTeardown: "./tests/e2e/global-teardown.ts",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // 1) Authenticate once and persist the session.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // 2) Everything else reuses the saved session.
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
