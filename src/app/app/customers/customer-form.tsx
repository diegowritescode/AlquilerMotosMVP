"use client";

import { useFormState } from "react-dom";
import type { Customer } from "@/lib/types";
import { DOCUMENT_TYPES, LICENSE_CATEGORIES } from "@/lib/types";
import type { ActionState } from "@/lib/actions/shared";
import { FILE_ACCEPT } from "@/lib/upload";
import { Field, Input, Select, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function CustomerForm({
  action,
  customer,
  submitLabel,
}: {
  action: Action;
  customer?: Customer;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const c = customer;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <FormSection title="Datos personales">
        <Field label="Nombre completo" htmlFor="full_name" required error={err.full_name?.[0]} className="sm:col-span-2">
          <Input id="full_name" name="full_name" defaultValue={c?.full_name} required />
        </Field>
        <Field label="Tipo de documento" htmlFor="document_type" required>
          <Select id="document_type" name="document_type" defaultValue={c?.document_type ?? "CC"}>
            {DOCUMENT_TYPES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Número de documento" htmlFor="document_number" required error={err.document_number?.[0]}>
          <Input id="document_number" name="document_number" defaultValue={c?.document_number} required />
        </Field>
        <Field label="Nacionalidad" htmlFor="nationality" required error={err.nationality?.[0]}>
          <Input id="nationality" name="nationality" defaultValue={c?.nationality ?? "Colombiana"} required />
        </Field>
        <Field label="Fecha de nacimiento" htmlFor="birth_date">
          <Input id="birth_date" name="birth_date" type="date" defaultValue={c?.birth_date ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Contacto">
        <Field label="Teléfono" htmlFor="phone" required error={err.phone?.[0]}>
          <Input id="phone" name="phone" type="tel" defaultValue={c?.phone} placeholder="3001234567" required />
        </Field>
        <Field label="Dirección" htmlFor="address">
          <Input id="address" name="address" defaultValue={c?.address ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Licencia de conducción">
        <Field label="Número de licencia" htmlFor="license_number">
          <Input id="license_number" name="license_number" defaultValue={c?.license_number ?? ""} />
        </Field>
        <Field label="Categoría" htmlFor="license_category">
          <Select id="license_category" name="license_category" defaultValue={c?.license_category ?? ""}>
            <option value="">Sin definir</option>
            {LICENSE_CATEGORIES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </Field>
        {!c ? (
          <Field
            label="Foto de la licencia (opcional)"
            htmlFor="license_file"
            hint="JPG, PNG, WEBP o PDF, hasta 5 MB. Podrás agregar más documentos desde la ficha del arrendatario."
            className="sm:col-span-2"
          >
            <input
              id="license_file"
              name="license_file"
              type="file"
              accept={FILE_ACCEPT}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface-3/80"
            />
          </Field>
        ) : (
          <p className="text-xs text-muted sm:col-span-2">
            Para subir/gestionar la foto de la licencia y otros documentos, usa la
            sección <strong>Documentos</strong> en la ficha del arrendatario.
          </p>
        )}
      </FormSection>

      <FormSection title="Información adicional">
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={c?.status ?? "activo"}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </Field>
        <Field label="Referencias" htmlFor="references_info" className="sm:col-span-2">
          <Textarea id="references_info" name="references_info" defaultValue={c?.references_info ?? ""} placeholder="Referencias personales o laborales..." />
        </Field>
        <Field label="Observaciones" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" defaultValue={c?.notes ?? ""} />
        </Field>
        {/* Document/photo uploads prepared via Supabase Storage (bucket: customer-documents). */}
        <input type="hidden" name="license_photo_url" defaultValue={c?.license_photo_url ?? ""} />
        <input type="hidden" name="front_photo_url" defaultValue={c?.front_photo_url ?? ""} />
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
