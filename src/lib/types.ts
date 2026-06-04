/**
 * Domain types for the Moto Rental MVP.
 * These mirror the SQL schema in `supabase/migrations` and the conceptual data
 * model described in the whitepaper (section 10).
 *
 * IDs are UUID strings. Money is stored in COP as integers (no decimals — COP
 * does not use cents in practice). Dates are ISO strings (yyyy-MM-dd) for plain
 * dates and full ISO timestamps for created/updated fields.
 */

// ---------------------------------------------------------------------------
// Enums (kept in sync with SQL CHECK constraints)
// ---------------------------------------------------------------------------

export const MOTORCYCLE_STATUSES = [
  "disponible",
  "alquilada",
  "mantenimiento",
  "inactiva",
] as const;
export type MotorcycleStatus = (typeof MOTORCYCLE_STATUSES)[number];

export const CONDITION_LEVELS = ["bueno", "regular", "malo"] as const;
export type ConditionLevel = (typeof CONDITION_LEVELS)[number];

export const DOCUMENT_TYPES = ["CC", "CE", "PEP", "PPT", "PASAPORTE"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const LICENSE_CATEGORIES = ["A1", "A2", "B1", "C1", "OTRA"] as const;
export type LicenseCategory = (typeof LICENSE_CATEGORIES)[number];

export const PAYMENT_FREQUENCIES = ["diario", "semanal", "mensual"] as const;
export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

export const RENTAL_STATUSES = [
  "pendiente_aprobacion",
  "activo",
  "finalizado",
  "cancelado",
  "vencido",
] as const;
export type RentalStatus = (typeof RENTAL_STATUSES)[number];

export const PAYMENT_METHODS = [
  "efectivo",
  "transferencia",
  "nequi",
  "bancolombia",
  "otro",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "pendiente",
  "parcial",
  "pagado",
  "vencido",
  "en_acuerdo",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const MAINTENANCE_TYPES = [
  "cambio_aceite",
  "revision_general",
  "frenos",
  "llantas",
  "motor",
  "otro",
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_STATUSES = ["programado", "realizado", "vencido"] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const FINE_STATUSES = [
  "pendiente",
  "pagada",
  "en_disputa",
  "asumida_cliente",
  "asumida_dueno",
] as const;
export type FineStatus = (typeof FINE_STATUSES)[number];

export const VEHICLE_DOCUMENT_TYPES = [
  "soat",
  "tecnomecanica",
  "impuestos",
] as const;
export type VehicleDocumentType = (typeof VEHICLE_DOCUMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Timestamps {
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Motorcycle extends Timestamps {
  id: string;
  brand: string;
  model: string;
  cc: number;
  year: number;
  plate: string;
  color: string;
  mileage: number;
  daily_price: number;
  weekly_price: number;
  monthly_price: number;
  general_condition: ConditionLevel;
  engine_condition: ConditionLevel;
  tires_condition: ConditionLevel;
  current_status: MotorcycleStatus;
  notes?: string | null;
  // Document expiration tracking (kept on the motorcycle for the MVP for
  // simplicity; a dedicated `motorcycle_documents` table also exists for
  // future per-document files). Dates are yyyy-MM-dd or null.
  soat_expiration?: string | null;
  tecnomecanica_expiration?: string | null;
  tax_expiration?: string | null;
  next_oil_change_date?: string | null;
  next_oil_change_mileage?: number | null;
  photo_url?: string | null;
}

export interface Customer extends Timestamps {
  id: string;
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  nationality: string;
  birth_date?: string | null;
  phone: string;
  address?: string | null;
  license_number?: string | null;
  license_category?: LicenseCategory | null;
  notes?: string | null;
  references_info?: string | null;
  license_photo_url?: string | null;
  front_photo_url?: string | null;
  status: "activo" | "inactivo";
}

export interface Rental extends Timestamps {
  id: string;
  customer_id: string;
  motorcycle_id: string;
  start_date: string;
  end_date?: string | null;
  agreed_value: number;
  payment_frequency: PaymentFrequency;
  payment_day?: string | null;
  status: RentalStatus;
  terms_accepted_at?: string | null;
  notes?: string | null;
}

export interface Payment extends Timestamps {
  id: string;
  rental_id?: string | null;
  customer_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  due_date?: string | null;
  paid_at?: string | null;
  reference?: string | null;
  evidence_url?: string | null;
  notes?: string | null;
}

export interface MaintenanceRecord extends Timestamps {
  id: string;
  motorcycle_id: string;
  type: MaintenanceType;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  next_date?: string | null;
  next_mileage?: number | null;
  status: MaintenanceStatus;
  notes?: string | null;
}

export interface Fine extends Timestamps {
  id: string;
  motorcycle_id: string;
  customer_id?: string | null;
  rental_id?: string | null;
  date: string;
  amount: number;
  reason: string;
  location_text?: string | null;
  lat?: number | null;
  lng?: number | null;
  status: FineStatus;
  evidence_url?: string | null;
  notes?: string | null;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_label?: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Derived / view models
// ---------------------------------------------------------------------------

export type ExpirationKind =
  | "soat"
  | "tecnomecanica"
  | "impuestos"
  | "cambio_aceite"
  | "mantenimiento"
  | "pago";

export interface ExpirationItem {
  id: string;
  kind: ExpirationKind;
  title: string;
  subtitle: string;
  date: string; // yyyy-MM-dd
  daysLeft: number;
  motorcycleId?: string;
  customerId?: string;
  amount?: number;
}
