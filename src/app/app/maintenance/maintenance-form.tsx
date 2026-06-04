"use client";

import { useFormState } from "react-dom";
import type { MaintenanceRecord, Motorcycle } from "@/lib/types";
import { MAINTENANCE_STATUSES, MAINTENANCE_TYPES } from "@/lib/types";
import { MAINTENANCE_STATUS_LABELS, MAINTENANCE_TYPE_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function MaintenanceForm({
  action,
  record,
  motorcycles,
  submitLabel,
  defaultMotorcycleId,
}: {
  action: Action;
  record?: MaintenanceRecord;
  motorcycles: Pick<Motorcycle, "id" | "brand" | "model" | "plate">[];
  submitLabel: string;
  defaultMotorcycleId?: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const r = record;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection title="Mantenimiento">
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
        <Field label="Tipo" htmlFor="type" required>
          <Select id="type" name="type" defaultValue={r?.type ?? "cambio_aceite"}>
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t} value={t}>{MAINTENANCE_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha" htmlFor="date" required error={err.date?.[0]}>
          <Input id="date" name="date" type="date" defaultValue={r?.date ?? ""} required />
        </Field>
        <Field label="Estado" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={r?.status ?? "programado"}>
            {MAINTENANCE_STATUSES.map((s) => (
              <option key={s} value={s}>{MAINTENANCE_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Kilometraje" htmlFor="mileage">
          <Input id="mileage" name="mileage" type="number" defaultValue={r?.mileage ?? ""} />
        </Field>
        <Field label="Costo (COP)" htmlFor="cost">
          <Input id="cost" name="cost" type="number" defaultValue={r?.cost ?? ""} />
        </Field>
        <Field label="Próxima fecha" htmlFor="next_date">
          <Input id="next_date" name="next_date" type="date" defaultValue={r?.next_date ?? ""} />
        </Field>
        <Field label="Próximo kilometraje" htmlFor="next_mileage">
          <Input id="next_mileage" name="next_mileage" type="number" defaultValue={r?.next_mileage ?? ""} />
        </Field>
        <Field label="Notas" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={r?.notes ?? ""} />
        </Field>
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
