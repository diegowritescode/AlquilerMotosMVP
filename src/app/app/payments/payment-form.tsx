"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { FileText } from "lucide-react";
import type { Customer, Payment } from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/types";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

interface RentalRef {
  id: string;
  label: string;
}

export function PaymentForm({
  action,
  payment,
  customers,
  activeRentals,
  currentRental,
  submitLabel,
  defaultCustomerId,
}: {
  action: Action;
  payment?: Payment;
  customers: Pick<Customer, "id" | "full_name" | "document_number">[];
  /** Alquiler activo por arrendatario: { customerId: {id, label} }. */
  activeRentals: Record<string, RentalRef>;
  /** Alquiler ya asociado al pago (modo edición), aunque no esté activo. */
  currentRental?: RentalRef | null;
  submitLabel: string;
  defaultCustomerId?: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const [customerId, setCustomerId] = useState(
    payment?.customer_id ?? defaultCustomerId ?? "",
  );
  const p = payment;
  const err = state.fieldErrors ?? {};

  // El alquiler se determina automáticamente: si estamos editando y no se cambió
  // el arrendatario, conserva el alquiler del pago; si no, usa el alquiler ACTIVO
  // del arrendatario seleccionado. Si no hay alquiler, no se muestra el campo.
  const keepCurrent =
    !!p?.rental_id && customerId === p.customer_id && !!currentRental;
  const rental: RentalRef | null = keepCurrent
    ? currentRental!
    : (activeRentals[customerId] ?? null);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection
        title="Pago"
        description="Registro interno de un pago recibido. El cobro se gestiona por fuera del sistema (efectivo, transferencia, Nequi, Bancolombia u otro)."
      >
        <Field label="Arrendatario" htmlFor="customer_id" required error={err.customer_id?.[0]}>
          <Select
            id="customer_id"
            name="customer_id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} · {c.document_number}
              </option>
            ))}
          </Select>
        </Field>

        {/* Alquiler asociado: automático según el arrendatario. */}
        {rental ? (
          <div className="sm:col-span-2">
            <span className="label-base">Alquiler asociado</span>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground">
              <FileText className="h-4 w-4 text-brand" />
              {rental.label}
            </div>
            <input type="hidden" name="rental_id" value={rental.id} />
            <p className="mt-1 text-xs text-muted">
              Se asocia automáticamente al alquiler activo de este arrendatario.
            </p>
          </div>
        ) : (
          <input type="hidden" name="rental_id" value="" />
        )}

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
        <input type="hidden" name="evidence_url" defaultValue={p?.evidence_url ?? ""} />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
