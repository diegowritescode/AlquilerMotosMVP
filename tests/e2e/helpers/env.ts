/**
 * Centralized E2E env access + capability flags.
 *
 * The suite adapts to the environment:
 *  - DEMO mode (no Supabase test creds): forms/flows still run; DB assertions
 *    and Supabase-only tests are skipped.
 *  - SUPABASE mode (E2E_SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL):
 *    real persistence assertions and cleanup run.
 */

export const E2E = {
  baseURL: process.env.E2E_BASE_URL || "http://localhost:3100",

  // Usuario principal usado por auth.setup.ts para crear storageState global.
  // IMPORTANTE: este usuario NO debe usarse en tests de logout en Supabase real,
  // porque signOut puede invalidar la sesión global compartida.
  adminEmail: process.env.E2E_ADMIN_EMAIL || "admin@motorental.co",
  adminPassword: process.env.E2E_ADMIN_PASSWORD || "demo1234",

  // Usuario separado recomendado para auth.spec.ts.
  // Debe existir en Supabase Auth y tener role='admin' en public.profiles.
  // Si no se configura, cae al usuario admin para mantener compatibilidad demo.
  authEmail:
    process.env.E2E_AUTH_EMAIL ||
    process.env.E2E_ADMIN_EMAIL ||
    "admin@motorental.co",

  authPassword:
    process.env.E2E_AUTH_PASSWORD ||
    process.env.E2E_ADMIN_PASSWORD ||
    "demo1234",

  prefix: process.env.E2E_TEST_PREFIX || "E2E",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  serviceRoleKey: process.env.E2E_SUPABASE_SERVICE_ROLE_KEY || "",
  allowCleanup: process.env.E2E_ALLOW_DB_CLEANUP === "true",
};

/** True when the suite can talk to Supabase directly (assertions + cleanup). */
export function hasDbAccess(): boolean {
  return Boolean(E2E.supabaseUrl && E2E.serviceRoleKey);
}

/**
 * True when the running app is backed by Supabase (so demo-login is disabled
 * and real persistence is expected). We infer this from the presence of the
 * public Supabase URL given to the test process.
 */
export function isSupabaseMode(): boolean {
  return Boolean(E2E.supabaseUrl);
}