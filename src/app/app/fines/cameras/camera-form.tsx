"use client";

import { useFormState } from "react-dom";
import type { TrafficCamera } from "@/lib/types";
import { CAMERA_TYPES } from "@/lib/types";
import { CAMERA_TYPE_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/actions/shared";
import { Field, Input, Select, Textarea, Label, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";
import { FineLocationPicker } from "@/components/maps/FineLocationPicker";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function CameraForm({
  action,
  camera,
  submitLabel,
}: {
  action: Action;
  camera?: TrafficCamera;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const c = camera;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection title="Cámara de fotodetección">
        <Field label="Nombre / ubicación" htmlFor="name" required error={err.name?.[0]} className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={c?.name} placeholder="Avenida 80 con Calle 30" required />
        </Field>
        <Field label="Tipo" htmlFor="type" required error={err.type?.[0]}>
          <Select id="type" name="type" defaultValue={c?.type ?? "velocidad"}>
            {CAMERA_TYPES.map((t) => (
              <option key={t} value={t}>{CAMERA_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Corredor / zona" htmlFor="zone">
          <Input id="zone" name="zone" defaultValue={c?.zone ?? ""} placeholder="Avenida 80" />
        </Field>
        <Field label="Velocidad máxima (km/h)" htmlFor="max_speed_kmh">
          <Input id="max_speed_kmh" name="max_speed_kmh" type="number" defaultValue={c?.max_speed_kmh ?? ""} placeholder="50" />
        </Field>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="approximate"
            name="approximate"
            type="checkbox"
            defaultChecked={c ? c.approximate : true}
            className="h-4 w-4 rounded border-border accent-brand"
          />
          <Label htmlFor="approximate" className="!mb-0">
            Ubicación aproximada (geocodificada, sin verificar en sitio)
          </Label>
        </div>
        <FineLocationPicker defaultLat={c?.lat ?? null} defaultLng={c?.lng ?? null} />
        <Field label="Fuente" htmlFor="source">
          <Input id="source" name="source" defaultValue={c?.source ?? ""} placeholder="Alcaldía de Medellín / ANSV" />
        </Field>
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={c?.notes ?? ""} />
        </Field>
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
