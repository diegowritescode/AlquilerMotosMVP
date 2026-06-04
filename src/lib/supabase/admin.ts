import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * SERVER-ONLY service-role Supabase client for the data layer.
 *
 * Why service role: in Fase 1 every data read/write happens on the server
 * (Server Components + Server Actions) for a single owner/admin. Using the
 * service-role key here keeps data access robust and independent of the
 * per-user RLS profile setup, while RLS stays ENABLED to block any direct
 * access via the public anon key (see supabase/migrations/0002_rls.sql).
 *
 * NEVER import this from a Client Component. The service-role key is read from
 * a non-public env var and is never sent to the browser.
 *
 * Returns null when not configured (URL or service role key missing) so the
 * caller can fall back to the demo store or the cookie/RLS client.
 */
const GLOBAL_KEY = "__MOTO_RENTAL_SUPABASE_ADMIN__";
type GlobalWithAdmin = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient | null;
};

export function createSupabaseAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  const g = globalThis as GlobalWithAdmin;
  if (g[GLOBAL_KEY] !== undefined) return g[GLOBAL_KEY] ?? null;

  g[GLOBAL_KEY] = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return g[GLOBAL_KEY] ?? null;
}

export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
