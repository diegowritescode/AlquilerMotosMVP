"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoLoginEnabled, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEMO_CREDENTIALS,
  SESSION_COOKIE,
  encodeDemoSession,
} from "@/lib/auth";

export interface AuthState {
  error?: string;
}

/**
 * Login server action. Uses Supabase Auth when configured; otherwise validates
 * against the documented demo credentials and sets a lightweight session cookie.
 */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña." };
  }

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) redirect("/app/dashboard");
      // If demo login is not explicitly allowed, fail here.
      if (!isDemoLoginEnabled()) return { error: "Credenciales inválidas." };
      // Otherwise fall through to the demo credential check below.
    }
  }

  // Demo mode (only when enabled).
  if (
    isDemoLoginEnabled() &&
    email.toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    cookies().set(
      SESSION_COOKIE,
      encodeDemoSession({ email, role: "admin" }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    );
    redirect("/app/dashboard");
  }

  return {
    error:
      "Credenciales inválidas. En modo demo usa admin@motorental.co / demo1234.",
  };
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase?.auth.signOut();
  }
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
