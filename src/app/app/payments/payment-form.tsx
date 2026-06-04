"use client";

import { useFormState } from "react-dom";
import type { Customer, Payment, Rental } from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/types";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function PaymentForm({
  action,
  payment,
  customers,
  rentals,
  submitLabel,
  defaultCustomerId,
  defaultRentalId,
}: {
  action: Action;
  payment?: Payment;
  customers: Pick<Customer, "id" | "full_name" | "document_number">[];
  rentals: Pick<Rental, "id" | "start_date" | "agreed_value" | "customer_id">[];
  submitLabel: string;
  defaultCustomerId?: string;
  defaultRentalId?: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const p = payment;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection
        title="Pago"
        description="Registro interno de un pago recibido. El cobro se gestiona por fuera del sistema (efectivo, transferencia, Nequi, Bancolombia u otro)."
      >
        <Field label="Arrendatario" htmlFor="customer_id" required error={err.customer_id?.[0]}>
          <Select id="customer_id" name="customer_id" defaultValue={p?.customer_id ?? defaultCustomerId ?? ""}>
            <option value="">Selecciona...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} · {c.document_number}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Alquiler (opcional)" htmlFor="rental_id">
          <Select id="rental_id" name="rental_id" defaultValue={p?.rental_id ?? defaultRentalId ?? ""}>
            <option value="">Sin alquiler asociado</option>
            {rentals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.start_date} · ${r.agreed_value.toLocaleString("es-CO")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Monto (COP)" htmlFor="amount" required error={err.amount?.[0]}>
          <Input id="amount" name="amount" type="number" defaultValue={p?.amount} required />
        </Field>
        <Field label="Método" htmlFor="method" required>
          <Select id="method" name="method" defaultValue={p?.method ?? "efectivo"}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Estado" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={p?.status ?? "pagado"}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha de vencimiento" htmlFor="due_date">
          <Input id="due_date" name="due_date" type="date" defaultValue={p?.due_date ?? ""} />
        </Field>
        <Field label="Fecha de pago" htmlFor="paid_at">
          <Input id="paid_at" name="paid_at" type="date" defaultValue={p?.paid_at ?? ""} />
        </Field>
        <Field label="Referencia" htmlFor="reference" hint="Nº de transacción, Nequi, etc.">
          <Input id="reference" name="reference" defaultValue={p?.reference ?? ""} />
        </Field>
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={p?.notes ?? ""} />
        </Field>
        {/* Evidence upload prepared via Supabase Storage (bucket: payment-evidence). */}
        <input type="hidden" name="evidence_url" defaultValue={p?.evidence_url ?? ""} />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
