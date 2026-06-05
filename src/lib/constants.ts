/** Shared display constants and label maps for enums. */

export const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Will";

export const MOTORCYCLE_STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  alquilada: "Alquilada",
  mantenimiento: "Mantenimiento",
  inactiva: "Inactiva",
};

export const RENTAL_STATUS_LABELS: Record<string, string> = {
  pendiente_aprobacion: "Pendiente",
  activo: "Activo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  vencido: "Vencido",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagado: "Pagado",
  vencido: "Vencido",
  en_acuerdo: "En acuerdo",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  otro: "Otro",
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  cambio_aceite: "Cambio de aceite",
  revision_general: "Revisión general",
  frenos: "Frenos",
  llantas: "Llantas",
  motor: "Motor",
  otro: "Otro",
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  programado: "Programado",
  realizado: "Realizado",
  vencido: "Vencido",
};

export const FINE_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  en_disputa: "En disputa",
  asumida_cliente: "Asumida por cliente",
  asumida_dueno: "Asumida por dueño",
};

export const PAYMENT_FREQUENCY_LABELS: Record<string, string> = {
  diario: "Diario",
  semanal: "Semanal",
  mensual: "Mensual",
};

export const CONDITION_LABELS: Record<string, string> = {
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};

import type { Tone } from "./utils";

export const MOTORCYCLE_STATUS_TONE: Record<string, Tone> = {
  disponible: "success",
  alquilada: "info",
  mantenimiento: "warning",
  inactiva: "neutral",
};

export const RENTAL_STATUS_TONE: Record<string, Tone> = {
  pendiente_aprobacion: "warning",
  activo: "success",
  finalizado: "neutral",
  cancelado: "danger",
  vencido: "danger",
};

export const PAYMENT_STATUS_TONE: Record<string, Tone> = {
  pendiente: "warning",
  parcial: "warning",
  pagado: "success",
  vencido: "danger",
  en_acuerdo: "info",
};

export const MAINTENANCE_STATUS_TONE: Record<string, Tone> = {
  programado: "warning",
  realizado: "success",
  vencido: "danger",
};

export const FINE_STATUS_TONE: Record<string, Tone> = {
  pendiente: "warning",
  pagada: "success",
  en_disputa: "info",
  asumida_cliente: "neutral",
  asumida_dueno: "neutral",
};

export const CONDITION_TONE: Record<string, Tone> = {
  bueno: "success",
  regular: "warning",
  malo: "danger",
};
