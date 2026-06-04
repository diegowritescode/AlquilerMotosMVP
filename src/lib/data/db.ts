import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "../supabase/admin";
import { createSupabaseServerClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/config";

/**
 * Returns the Supabase client the DATA LAYER should use, or null for demo mode.
 *
 * Priority:
 *   1. Service-role admin client (server-only) when SUPABASE_SERVICE_ROLE_KEY
 *      is set — preferred for the single-admin Fase 1 app.
 *   2. Cookie-based server client (respects RLS via the logged-in session) when
 *      only the public URL + anon key are set.
 *   3. null  -> in-memory demo store (src/lib/mock).
 *
 * Server-only. Data modules that import this must never be used in Client
 * Components.
 */
export function getDataClient(): SupabaseClient | null {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  if (isSupabaseConfigured()) return createSupabaseServerClient();
  return null;
}

/** True when the app is running on the in-memory demo store. */
export function isDemoData(): boolean {
  if (createSupabaseAdminClient()) return false;
  return !isSupabaseConfigured();
}

/** Throw a readable error instead of leaking raw PostgREST errors. */
export function unwrap<T>(
  result: { data: T | null; error: { message: string } | null },
  context: string,
): T {
  if (result.error) {
    throw new Error(`[Supabase] ${context}: ${result.error.message}`);
  }
  return result.data as T;
}
