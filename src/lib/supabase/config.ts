/**
 * Detects whether real Supabase credentials are present.
 *
 * The MVP ships with a seeded in-memory data layer (see src/lib/mock) so the
 * app is fully runnable and demoable WITHOUT credentials. When the env vars
 * below are set, the Supabase clients become usable for Auth, and the data
 * layer can be migrated to Postgres using the SQL in supabase/migrations.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Whether the cookie-based demo login is allowed.
 * Enabled automatically when Supabase is NOT configured, or explicitly via
 * ALLOW_DEMO_LOGIN=true (useful to keep demo access on a configured staging).
 */
export function isDemoLoginEnabled(): boolean {
  return !isSupabaseConfigured() || process.env.ALLOW_DEMO_LOGIN === "true";
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
