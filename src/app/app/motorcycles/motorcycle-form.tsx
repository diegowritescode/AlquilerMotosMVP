"use client";

import { useFormState } from "react-dom";
import type { Motorcycle } from "@/lib/types";
import {
  CONDITION_LEVELS,
  MOTORCYCLE_STATUSES,
} from "@/lib/types";
import {
  CONDITION_LABELS,
  MOTORCYCLE_STATUS_LABELS,
} from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function MotorcycleForm({
  action,
  motorcycle,
  submitLabel,
}: {
  action: Action;
  motorcycle?: Motorcycle;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const m = motorcycle;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection title="Información general">
        <Field label="Marca" htmlFor="brand" required error={err.brand?.[0]}>
          <Input id="brand" name="brand" defaultValue={m?.brand} required />
        </Field>
        <Field label="Modelo" htmlFor="model" required error={err.model?.[0]}>
          <Input id="model" name="model" defaultValue={m?.model} required />
        </Field>
        <Field label="Cilindraje (cc)" htmlFor="cc" required error={err.cc?.[0]}>
          <Input id="cc" name="cc" type="number" defaultValue={m?.cc} required />
        </Field>
        <Field label="Año" htmlFor="year" required error={err.year?.[0]}>
          <Input id="year" name="year" type="number" defaultValue={m?.year} required />
        </Field>
        <Field label="Placa" htmlFor="plate" required error={err.plate?.[0]}>
          <Input
            id="plate"
            name="plate"
            defaultValue={m?.plate}
            placeholder="ABC12D"
            className="uppercase"
            required
          />
        </Field>
        <Field label="Color" htmlFor="color" required error={err.color?.[0]}>
          <Input id="color" name="color" defaultValue={m?.color} required />
        </Field>
        <Field label="Kilometraje" htmlFor="mileage" required error={err.mileage?.[0]}>
          <Input id="mileage" name="mileage" type="number" defaultValue={m?.mileage} required />
        </Field>
        <Field label="Estado actual" htmlFor="current_status" required>
          <Select
            id="current_status"
            name="current_status"
            defaultValue={m?.current_status ?? "disponible"}
          >
            {MOTORCYCLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {MOTORCYCLE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Tarifas (COP)">
        <Field label="Valor diario" htmlFor="daily_price" required error={err.daily_price?.[0]}>
          <Input id="daily_price" name="daily_price" type="number" defaultValue={m?.daily_price} required />
        </Field>
        <Field label="Valor semanal" htmlFor="weekly_price" required error={err.weekly_price?.[0]}>
          <Input id="weekly_price" name="weekly_price" type="number" defaultValue={m?.weekly_price} required />
        </Field>
        <Field label="Valor mensual" htmlFor="monthly_price" required error={err.monthly_price?.[0]}>
          <Input id="monthly_price" name="monthly_price" type="number" defaultValue={m?.monthly_price} required />
        </Field>
      </FormSection>

      <FormSection title="Condición técnica">
        <Field label="Estado general" htmlFor="general_condition">
          <Select id="general_condition" name="general_condition" defaultValue={m?.general_condition ?? "bueno"}>
            {CONDITION_LEVELS.map((c) => (
              <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Estado del motor" htmlFor="engine_condition">
          <Select id="engine_condition" name="engine_condition" defaultValue={m?.engine_condition ?? "bueno"}>
            {CONDITION_LEVELS.map((c) => (
              <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Estado de llantas" htmlFor="tires_condition">
          <Select id="tires_condition" name="tires_condition" defaultValue={m?.tires_condition ?? "bueno"}>
            {CONDITION_LEVELS.map((c) => (
              <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <FormSection
        title="Documentos y vencimientos"
        description="Fechas usadas para las alertas de vencimientos."
      >
        <Field label="Vence SOAT" htmlFor="soat_expiration">
          <Input id="soat_expiration" name="soat_expiration" type="date" defaultValue={m?.soat_expiration ?? ""} />
        </Field>
        <Field label="Vence Tecnomecánica" htmlFor="tecnomecanica_expiration">
          <Input id="tecnomecanica_expiration" name="tecnomecanica_expiration" type="date" defaultValue={m?.tecnomecanica_expiration ?? ""} />
        </Field>
        <Field label="Vence Impuestos" htmlFor="tax_expiration">
          <Input id="tax_expiration" name="tax_expiration" type="date" defaultValue={m?.tax_expiration ?? ""} />
        </Field>
        <Field label="Próximo cambio de aceite (fecha)" htmlFor="next_oil_change_date">
          <Input id="next_oil_change_date" name="next_oil_change_date" type="date" defaultValue={m?.next_oil_change_date ?? ""} />
        </Field>
        <Field label="Próximo cambio de aceite (km)" htmlFor="next_oil_change_mileage">
          <Input id="next_oil_change_mileage" name="next_oil_change_mileage" type="number" defaultValue={m?.next_oil_change_mileage ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Otros">
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={m?.notes ?? ""} placeholder="Notas internas sobre la moto..." />
        </Field>
        {/* Photo upload is prepared via Supabase Storage (bucket: motorcycle-photos).
            Activates when Supabase is configured — see src/lib/storage.ts */}
        <input type="hidden" name="photo_url" defaultValue={m?.photo_url ?? ""} />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
