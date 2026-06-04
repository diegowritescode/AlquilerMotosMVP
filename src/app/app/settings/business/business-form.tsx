"use client";

import { useFormState } from "react-dom";
import type { BusinessSettings } from "@/lib/data/business-settings";
import { updateBusinessSettingsAction } from "@/lib/actions/business-settings";
import { Field, Input, Textarea, FormSection } from "@/components/ui/form";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

export function BusinessForm({ settings }: { settings: BusinessSettings }) {
  const [state, formAction] = useFormState(updateBusinessSettingsAction, {});
  const s = settings;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? (
        <FormMessage type="success">Configuración guardada.</FormMessage>
      ) : null}

      <p className="text-sm text-muted">
        Estos datos se usan en el acta PDF y en la información interna del negocio.
      </p>

      <FormSection title="Datos del negocio">
        <Field label="Nombre del negocio" htmlFor="business_name" required error={err.business_name?.[0]} className="sm:col-span-2">
          <Input id="business_name" name="business_name" defaultValue={s.business_name} required />
        </Field>
        <Field label="Ciudad" htmlFor="city">
          <Input id="city" name="city" defaultValue={s.city ?? ""} />
        </Field>
        <Field label="Dirección" htmlFor="address">
          <Input id="address" name="address" defaultValue={s.address ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Propietario">
        <Field label="Nombre del propietario" htmlFor="owner_name">
          <Input id="owner_name" name="owner_name" defaultValue={s.owner_name ?? ""} />
        </Field>
        <Field label="Documento / NIT" htmlFor="owner_document">
          <Input id="owner_document" name="owner_document" defaultValue={s.owner_document ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Contacto">
        <Field label="Teléfono" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={s.phone ?? ""} />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp" hint="Solo dígitos, ej. 573001234567">
          <Input id="whatsapp" name="whatsapp" defaultValue={s.whatsapp ?? ""} />
        </Field>
        <Field label="Correo" htmlFor="email" error={err.email?.[0]}>
          <Input id="email" name="email" type="email" defaultValue={s.email ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Configuración operativa">
        <Field label="Moneda" htmlFor="currency">
          <Input id="currency" name="currency" defaultValue={s.currency} />
        </Field>
        <Field
          label="Alerta de vencimientos (días antes)"
          htmlFor="alert_days_before_expiration"
          error={err.alert_days_before_expiration?.[0]}
        >
          <Input
            id="alert_days_before_expiration"
            name="alert_days_before_expiration"
            type="number"
            defaultValue={s.alert_days_before_expiration}
          />
        </Field>
      </FormSection>

      <FormSection title="Acta del alquiler">
        <Field
          label="Términos personalizados del acta"
          htmlFor="contract_terms_text"
          hint="Opcional. Si lo dejas vacío, el acta usa las condiciones por defecto."
          className="sm:col-span-2"
        >
          <Textarea
            id="contract_terms_text"
            name="contract_terms_text"
            defaultValue={s.contract_terms_text ?? ""}
            className="min-h-[120px]"
            placeholder="Una condición por línea..."
          />
        </Field>
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton size="lg">Guardar configuración</SubmitButton>
      </div>
    </form>
  );
}
