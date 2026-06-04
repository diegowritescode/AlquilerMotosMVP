import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike } from "lucide-react";
import { getSession } from "@/lib/auth";
import { isDemoLoginEnabled } from "@/lib/supabase/config";
import { BUSINESS_NAME } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata = { title: "Ingresar" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/app/dashboard");

  const demo = isDemoLoginEnabled();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-black">
            <Bike className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-foreground">
            {BUSINESS_NAME}
          </h1>
          <p className="mt-1 text-sm text-muted">Panel administrativo</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <LoginForm />
        </div>

        {demo ? (
          <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-3 text-center text-xs text-muted">
            <p className="font-medium text-brand">Modo demo</p>
            <p className="mt-1">
              Usuario: <span className="text-foreground">admin@motorental.co</span>
              <br />
              Contraseña: <span className="text-foreground">demo1234</span>
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
