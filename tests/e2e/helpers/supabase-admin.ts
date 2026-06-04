import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { E2E } from "./env";

/**
 * Direct Supabase client for TESTS ONLY, using a dedicated test service-role
 * key (E2E_SUPABASE_SERVICE_ROLE_KEY). Never reuse the app's runtime key here,
 * and never import this from app code. Returns null in demo mode.
 */
let cached: SupabaseClient | null | undefined;

export function getTestDbClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!E2E.supabaseUrl || !E2E.serviceRoleKey) {
    cached = null;
    return null;
  }
  cached = createClient(E2E.supabaseUrl, E2E.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
