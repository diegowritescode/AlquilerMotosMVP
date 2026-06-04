"use client";

import { useFormState } from "react-dom";
import type { Customer, Motorcycle, Rental } from "@/lib/types";
import { PAYMENT_FREQUENCIES, RENTAL_STATUSES } from "@/lib/types";
import {
  PAYMENT_FREQUENCY_LABELS,
  RENTAL_STATUS_LABELS,
} from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function RentalForm({
  action,
  rental,
  customers,
  motorcycles,
  submitLabel,
  defaultCustomerId,
  defaultMotorcycleId,
}: {
  action: Action;
  rental?: Rental;
  customers: Pick<Customer, "id" | "full_name" | "document_number">[];
  motorcycles: Pick<Motorcycle, "id" | "brand" | "model" | "plate" | "weekly_price">[];
  submitLabel: string;
  defaultCustomerId?: string;
  defaultMotorcycleId?: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const r = rental;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection title="Arrendatario y moto">
        <Field label="Arrendatario" htmlFor="customer_id" required error={err.customer_id?.[0]}>
          <Select id="customer_id" name="customer_id" defaultValue={r?.customer_id ?? defaultCustomerId ?? ""}>
            <option value="">Selecciona...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} · {c.document_number}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Moto" htmlFor="motorcycle_id" required error={err.motorcycle_id?.[0]}>
          <Select id="motorcycle_id" name="motorcycle_id" defaultValue={r?.motorcycle_id ?? defaultMotorcycleId ?? ""}>
            <option value="">Selecciona...</option>
            {motorcycles.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model} · {m.plate}
              </option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Condiciones del alquiler">
        <Field label="Fecha de inicio" htmlFor="start_date" required error={err.start_date?.[0]}>
          <Input id="start_date" name="start_date" type="date" defaultValue={r?.start_date ?? ""} required />
        </Field>
        <Field label="Fecha de fin" htmlFor="end_date" hint="Opcional para alquileres abiertos">
          <Input id="end_date" name="end_date" type="date" defaultValue={r?.end_date ?? ""} />
        </Field>
        <Field label="Valor acordado (COP)" htmlFor="agreed_value" required error={err.agreed_value?.[0]}>
          <Input id="agreed_value" name="agreed_value" type="number" defaultValue={r?.agreed_value} required />
        </Field>
        <Field label="Frecuencia de pago" htmlFor="payment_frequency" required>
          <Select id="payment_frequency" name="payment_frequency" defaultValue={r?.payment_frequency ?? "semanal"}>
            {PAYMENT_FREQUENCIES.map((f) => (
              <option key={f} value={f}>{PAYMENT_FREQUENCY_LABELS[f]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Día de pago" htmlFor="payment_day" hint="Ej. lunes, viernes">
          <Input id="payment_day" name="payment_day" defaultValue={r?.payment_day ?? ""} placeholder="lunes" />
        </Field>
        <Field label="Estado" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={r?.status ?? "activo"}>
            {RENTAL_STATUSES.map((s) => (
              <option key={s} value={s}>{RENTAL_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={r?.notes ?? ""} />
        </Field>
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
