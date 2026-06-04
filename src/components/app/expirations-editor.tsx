"use client";

import { useFormState } from "react-dom";
import { Pencil } from "lucide-react";
import { daysUntil, formatDate, relativeExpiry } from "@/lib/utils";
import type { Tone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type State = { error?: string; success?: boolean };
type Action = (prev: State, formData: FormData) => Promise<State>;

function tone(date?: string | null): Tone {
  const d = daysUntil(date);
  if (d === null) return "neutral";
  if (d < 0) return "danger";
  if (d <= 7) return "warning";
  return "success";
}

const ROWS = [
  { key: "soat_expiration", label: "SOAT" },
  { key: "tecnomecanica_expiration", label: "Tecnomecánica" },
  { key: "tax_expiration", label: "Impuestos" },
  { key: "next_oil_change_date", label: "Cambio de aceite" },
] as const;

/**
 * Read-only status of the moto's document dates + an inline "Actualizar fechas"
 * form so the owner can renew a document (resolver un vencimiento) sin abrir el
 * formulario completo de la moto.
 */
export interface ExpirationValues {
  soat_expiration: string | null;
  tecnomecanica_expiration: string | null;
  tax_expiration: string | null;
  next_oil_change_date: string | null;
  next_oil_change_mileage: number | null;
}

export function ExpirationsEditor({
  action,
  values,
}: {
  action: Action;
  values: ExpirationValues;
}) {
  const [state, formAction] = useFormState(action, {} as State);

  return (
    <div className="space-y-3">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? (
        <FormMessage type="success">Fechas actualizadas.</FormMessage>
      ) : null}

      <div className="space-y-2">
        {ROWS.map((r) => {
          const date = values[r.key];
          return (
            <div
              key={r.key}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted">
                  {date ? `Vence ${formatDate(date)}` : "Sin fecha registrada"}
                </p>
              </div>
              <Badge tone={tone(date)}>
                {date ? relativeExpiry(date) : "—"}
              </Badge>
            </div>
          );
        })}
      </div>

      <details className="group rounded-xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-brand marker:hidden">
          <Pencil className="h-4 w-4" /> Actualizar fechas
        </summary>
        <form action={formAction} className="space-y-3 border-t border-border p-3.5">
          <p className="text-xs text-muted">
            Al renovar un documento, actualiza su fecha aquí y dejará de aparecer
            como vencido.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Vence SOAT" htmlFor="soat_expiration">
              <Input id="soat_expiration" name="soat_expiration" type="date" defaultValue={values.soat_expiration ?? ""} />
            </Field>
            <Field label="Vence Tecnomecánica" htmlFor="tecnomecanica_expiration">
              <Input id="tecnomecanica_expiration" name="tecnomecanica_expiration" type="date" defaultValue={values.tecnomecanica_expiration ?? ""} />
            </Field>
            <Field label="Vence Impuestos" htmlFor="tax_expiration">
              <Input id="tax_expiration" name="tax_expiration" type="date" defaultValue={values.tax_expiration ?? ""} />
            </Field>
            <Field label="Próximo cambio de aceite" htmlFor="next_oil_change_date">
              <Input id="next_oil_change_date" name="next_oil_change_date" type="date" defaultValue={values.next_oil_change_date ?? ""} />
            </Field>
            <Field label="Próximo cambio de aceite (km)" htmlFor="next_oil_change_mileage">
              <Input id="next_oil_change_mileage" name="next_oil_change_mileage" type="number" defaultValue={values.next_oil_change_mileage ?? ""} />
            </Field>
          </div>
          <SubmitButton size="sm">Guardar fechas</SubmitButton>
        </form>
      </details>
    </div>
  );
}
