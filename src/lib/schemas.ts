import { z } from "zod";
import {
  CONDITION_LEVELS,
  DOCUMENT_TYPES,
  FINE_STATUSES,
  LICENSE_CATEGORIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  MOTORCYCLE_STATUSES,
  PAYMENT_FREQUENCIES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  RENTAL_STATUSES,
} from "./types";

/**
 * Zod schemas for form/server-action validation.
 * Inputs arrive as strings from <form> data; we coerce numbers and normalize
 * empty strings to null for optional fields.
 */

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isNaN(n) ? null : n;
  });

const requiredNumber = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .pipe(z.number({ invalid_type_error: "Debe ser un número" }).nonnegative());

// Reasonable motorcycle model year: 1950 .. next year.
const yearSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .pipe(
    z
      .number({ invalid_type_error: "Año inválido" })
      .int("Año inválido")
      .min(1950, "Año demasiado antiguo")
      .max(new Date().getFullYear() + 1, "Año demasiado en el futuro"),
  );

// ---------------------------------------------------------------------------
// Motorcycle
// ---------------------------------------------------------------------------

export const motorcycleSchema = z.object({
  brand: z.string().trim().min(1, "La marca es obligatoria"),
  model: z.string().trim().min(1, "El modelo es obligatorio"),
  cc: requiredNumber,
  year: yearSchema,
  plate: z
    .string()
    .trim()
    .min(3, "La placa es obligatoria")
    .transform((v) => v.toUpperCase()),
  color: z.string().trim().min(1, "El color es obligatorio"),
  mileage: requiredNumber,
  daily_price: requiredNumber,
  weekly_price: requiredNumber,
  monthly_price: requiredNumber,
  general_condition: z.enum(CONDITION_LEVELS),
  engine_condition: z.enum(CONDITION_LEVELS),
  tires_condition: z.enum(CONDITION_LEVELS),
  current_status: z.enum(MOTORCYCLE_STATUSES),
  notes: optionalString,
  soat_expiration: optionalDate,
  tecnomecanica_expiration: optionalDate,
  tax_expiration: optionalDate,
  next_oil_change_date: optionalDate,
  next_oil_change_mileage: optionalNumber,
  photo_url: optionalString,
});
export type MotorcycleInput = z.infer<typeof motorcycleSchema>;

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export const customerSchema = z.object({
  full_name: z.string().trim().min(1, "El nombre es obligatorio"),
  document_type: z.enum(DOCUMENT_TYPES),
  document_number: z.string().trim().min(3, "El número de documento es obligatorio"),
  nationality: z.string().trim().min(1, "La nacionalidad es obligatoria"),
  birth_date: optionalDate,
  phone: z.string().trim().min(7, "El teléfono es obligatorio"),
  address: optionalString,
  license_number: optionalString,
  license_category: z
    .union([z.enum(LICENSE_CATEGORIES), z.literal("")])
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  references_info: optionalString,
  notes: optionalString,
  license_photo_url: optionalString,
  front_photo_url: optionalString,
  status: z.enum(["activo", "inactivo"]).default("activo"),
});
export type CustomerInput = z.infer<typeof customerSchema>;

// ---------------------------------------------------------------------------
// Rental
// ---------------------------------------------------------------------------

export const rentalSchema = z.object({
  customer_id: z.string().trim().min(1, "Selecciona un arrendatario"),
  motorcycle_id: z.string().trim().min(1, "Selecciona una moto"),
  start_date: z.string().trim().min(1, "La fecha de inicio es obligatoria"),
  end_date: optionalDate,
  agreed_value: requiredNumber,
  payment_frequency: z.enum(PAYMENT_FREQUENCIES),
  payment_day: optionalString,
  status: z.enum(RENTAL_STATUSES),
  notes: optionalString,
});
export type RentalInput = z.infer<typeof rentalSchema>;

/** Used when finalizing a rental — controls the moto's resulting status. */
export const rentalFinalizeSchema = z.object({
  rental_id: z.string().min(1),
  next_motorcycle_status: z.enum(["disponible", "mantenimiento"]),
});

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export const paymentSchema = z.object({
  rental_id: optionalString,
  customer_id: z.string().trim().min(1, "Selecciona un arrendatario"),
  amount: requiredNumber,
  method: z.enum(PAYMENT_METHODS),
  status: z.enum(PAYMENT_STATUSES),
  due_date: optionalDate,
  paid_at: optionalDate,
  reference: optionalString,
  evidence_url: optionalString,
  notes: optionalString,
});
export type PaymentInput = z.infer<typeof paymentSchema>;

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

export const maintenanceSchema = z.object({
  motorcycle_id: z.string().trim().min(1, "Selecciona una moto"),
  type: z.enum(MAINTENANCE_TYPES),
  date: z.string().trim().min(1, "La fecha es obligatoria"),
  mileage: optionalNumber,
  cost: optionalNumber,
  next_date: optionalDate,
  next_mileage: optionalNumber,
  status: z.enum(MAINTENANCE_STATUSES),
  notes: optionalString,
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

// ---------------------------------------------------------------------------
// Fine
// ---------------------------------------------------------------------------

export const fineSchema = z.object({
  motorcycle_id: z.string().trim().min(1, "Selecciona una moto"),
  customer_id: optionalString,
  rental_id: optionalString,
  date: z.string().trim().min(1, "La fecha es obligatoria"),
  amount: requiredNumber,
  reason: z.string().trim().min(1, "El motivo es obligatorio"),
  location_text: optionalString,
  lat: optionalNumber,
  lng: optionalNumber,
  status: z.enum(FINE_STATUSES),
  evidence_url: optionalString,
  notes: optionalString,
});
export type FineInput = z.infer<typeof fineSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert FormData to a plain object Zod can parse. */
export function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") obj[key] = value;
  }
  return obj;
}
