"use client";

import { useFormState } from "react-dom";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

const initial: AuthState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      <Field label="Correo" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@motorental.co"
          defaultValue="admin@motorental.co"
          required
        />
      </Field>
      <Field label="Contraseña" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Ingresando...">
        Ingresar
      </SubmitButton>
    </form>
  );
}
