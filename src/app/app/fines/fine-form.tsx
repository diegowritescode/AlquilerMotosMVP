"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { Info } from "lucide-react";
import type { Customer, Fine, Motorcycle } from "@/lib/types";
import { FINE_STATUSES } from "@/lib/types";
import { FINE_STATUS_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";
import { FineLocationPicker } from "@/components/maps/FineLocationPicker";
import type { MapCamera } from "@/components/maps/types";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function FineForm({
  action,
  fine,
  motorcycles,
  customers,
  cameras = [],
  submitLabel,
  defaultMotorcycleId,
}: {
  action: Action;
  fine?: Fine;
  motorcycles: Pick<Motorcycle, "id" | "brand" | "model" | "plate">[];
  customers: Pick<Customer, "id" | "full_name" | "document_number">[];
  cameras?: MapCamera[];
  submitLabel: string;
  defaultMotorcycleId?: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const f = fine;
  const err = state.fieldErrors ?? {};

  // Controlled so a picked camera can autocomplete them.
  const [reason, setReason] = useState(f?.reason ?? "");
  const [locationText, setLocationText] = useState(f?.location_text ?? "");

  // Associating a camera fills the location with its name and, when the reason
  // is still empty, suggests one from the camera type. Never overwrites a
  // reason the user already typed.
  const handleCameraPick = (cam: MapCamera) => {
    setLocationText(cam.name);
    setReason((prev) => (prev.trim() ? prev : cam.typeLabel));
  };

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <div className="flex items-start gap-2 rounded-xl border border-info/30 bg-info/10 px-3.5 py-2.5 text-xs text-info">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          La consulta oficial de comparendos (SIMIT/RUNT) debe hacerse de forma
          manual. Registra aquí la infracción encontrada. Si dejas el
          arrendatario vacío, el sistema sugerirá el responsable según el
          alquiler activo en la fecha.
        </span>
      </div>

      <FormSection title="Infracción / Fotomulta">
        <Field label="Moto" htmlFor="motorcycle_id" required error={err.motorcycle_id?.[0]}>
          <Select id="motorcycle_id" name="motorcycle_id" defaultValue={f?.motorcycle_id ?? defaultMotorcycleId ?? ""}>
            <option value="">Selecciona...</option>
            {motorcycles.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model} · {m.plate}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Arrendatario responsable" htmlFor="customer_id" hint="Opcional — se sugiere automáticamente">
          <Select id="customer_id" name="customer_id" defaultValue={f?.customer_id ?? ""}>
            <option value="">Sugerir automáticamente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} · {c.document_number}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha" htmlFor="date" required error={err.date?.[0]}>
          <Input id="date" name="date" type="date" defaultValue={f?.date ?? ""} required />
        </Field>
        <Field label="Valor (COP)" htmlFor="amount" required error={err.amount?.[0]}>
          <Input id="amount" name="amount" type="number" defaultValue={f?.amount} required />
        </Field>
        <Field label="Motivo" htmlFor="reason" required error={err.reason?.[0]} className="sm:col-span-2">
          <Input id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Exceso de velocidad, semáforo en rojo..." required />
        </Field>
        <Field label="Estado" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={f?.status ?? "pendiente"}>
            {FINE_STATUSES.map((s) => (
              <option key={s} value={s}>{FINE_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ubicación (texto)" htmlFor="location_text" className="sm:col-span-2">
          <Input id="location_text" name="location_text" value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Cl. 30 con Cra. 65, El Poblado" />
        </Field>
        <FineLocationPicker
          defaultLat={f?.lat ?? null}
          defaultLng={f?.lng ?? null}
          cameras={cameras}
          defaultCameraId={f?.camera_id ?? null}
          onCameraPick={handleCameraPick}
        />
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={f?.notes ?? ""} />
        </Field>
        {/* Evidence upload prepared via Supabase Storage (bucket: fine-evidence). */}
        <input type="hidden" name="evidence_url" defaultValue={f?.evidence_url ?? ""} />
        <input type="hidden" name="rental_id" defaultValue={f?.rental_id ?? ""} />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
