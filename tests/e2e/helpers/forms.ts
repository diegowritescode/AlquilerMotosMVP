import { type Page, expect } from "@playwright/test";

/**
 * Form-fill helpers using accessible labels (Field renders <label for> + input).
 * Keeps specs short and resilient to layout changes.
 */

export async function fillMotorcycleForm(
  page: Page,
  data: Record<string, string>,
) {
  if (data.brand !== undefined) await page.getByLabel("Marca").fill(data.brand);
  if (data.model !== undefined) await page.getByLabel("Modelo").fill(data.model);
  if (data.cc !== undefined) await page.getByLabel("Cilindraje (cc)").fill(data.cc);
  if (data.year !== undefined) await page.getByLabel("Año").fill(data.year);
  if (data.plate !== undefined) await page.getByLabel("Placa").fill(data.plate);
  if (data.color !== undefined) await page.getByLabel("Color").fill(data.color);
  if (data.mileage !== undefined) await page.getByLabel("Kilometraje").fill(data.mileage);
  if (data.daily_price !== undefined) await page.getByLabel("Valor diario").fill(data.daily_price);
  if (data.weekly_price !== undefined) await page.getByLabel("Valor semanal").fill(data.weekly_price);
  if (data.monthly_price !== undefined) await page.getByLabel("Valor mensual").fill(data.monthly_price);
  if (data.current_status !== undefined)
    await page.getByLabel("Estado actual").selectOption(data.current_status);
}

export async function fillCustomerForm(
  page: Page,
  data: Record<string, string>,
) {
  if (data.full_name !== undefined) await page.getByLabel("Nombre completo").fill(data.full_name);
  if (data.document_number !== undefined)
    await page.getByLabel("Número de documento").fill(data.document_number);
  if (data.nationality !== undefined) await page.getByLabel("Nacionalidad").fill(data.nationality);
  if (data.phone !== undefined) await page.getByLabel("Teléfono").fill(data.phone);
  if (data.address !== undefined) await page.getByLabel("Dirección").fill(data.address);
}

/** Assert a required input blocks native submission (stays invalid). */
export async function expectRequiredBlocks(page: Page, label: string) {
  const field = page.getByLabel(label);
  const valid = await field.evaluate(
    (el) => (el as HTMLInputElement).validity.valid,
  );
  expect(valid).toBe(false);
}
