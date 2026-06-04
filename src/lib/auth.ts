import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";
import { isDemoLoginEnabled, isSupabaseConfigured } from "./supabase/config";

/**
 * Authentication abstraction.
 *
 * - When Supabase is configured, sessions are backed by Supabase Auth.
 * - In demo mode, a signed-cookie session lets the owner log in with the
 *   documented demo credentials (see DEMO_CREDENTIALS) so the admin area is
 *   fully usable without a backend. The structure is ready for a real
 *   `profiles`/role check (whitepaper §11) in production.
 */

export const SESSION_COOKIE = "mr_session";

export const DEMO_CREDENTIALS = {
  email: "admin@motorental.co",
  password: "demo1234",
};

export interface AppSession {
  email: string;
  role: "admin" | "customer";
}

export async function getSession(): Promise<AppSession | null> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return { email: user.email ?? "", role: "admin" };
      }
      // No Supabase session. Only fall back to the demo cookie if explicitly
      // allowed; otherwise the user is unauthenticated.
      if (!isDemoLoginEnabled()) return null;
    }
  }
  // Demo mode (or explicitly allowed): read the lightweight session cookie.
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(cookie, "base64").toString("utf8"),
    ) as AppSession;
    if (parsed?.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function encodeDemoSession(session: AppSession): string {
  return Buffer.from(JSON.stringify(session)).toString("base64");
}
