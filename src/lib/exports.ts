import { listMotorcycles } from "@/lib/data/motorcycles";
import { listCustomers } from "@/lib/data/customers";
import { listRentals } from "@/lib/data/rentals";
import { listPayments } from "@/lib/data/payments";
import { listFines } from "@/lib/data/fines";
import { listMaintenance } from "@/lib/data/maintenance";
import {
  FINE_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  MOTORCYCLE_STATUS_LABELS,
  PAYMENT_FREQUENCY_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  RENTAL_STATUS_LABELS,
} from "@/lib/constants";
import { exportFilename, toCsv, type CsvValue } from "@/lib/csv";

/**
 * Server-side CSV exporters for the admin's operational data. Metadata only —
 * NO files/photos/documents are included (those live in private Storage).
 */
export const EXPORT_TYPES = [
  "motos",
  "arrendatarios",
  "alquileres",
  "pagos",
  "fotomultas",
  "mantenimientos",
] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export function isExportType(v: string): v is ExportType {
  return (EXPORT_TYPES as readonly string[]).includes(v);
}

export interface ExportResult {
  filename: string;
  csv: string;
}

export async function buildExport(
  type: ExportType,
  now: Date,
): Promise<ExportResult> {
  switch (type) {
    case "motos":
      return motos(now);
    case "arrendatarios":
      return arrendatarios(now);
    case "alquileres":
      return alquileres(now);
    case "pagos":
      return pagos(now);
    case "fotomultas":
      return fotomultas(now);
    case "mantenimientos":
      return mantenimientos(now);
  }
}

async function motos(now: Date): Promise<ExportResult> {
  const rows = await listMotorcycles();
  const headers = [
    "placa", "marca", "modelo", "cilindraje", "anio", "estado", "kilometraje",
    "valor_diario", "valor_semanal", "valor_mensual",
    "soat_vence", "tecnomecanica_vence", "impuestos_vence", "proximo_aceite",
  ];
  const data: CsvValue[][] = rows.map((m) => [
    m.plate, m.brand, m.model, m.cc, m.year,
    MOTORCYCLE_STATUS_LABELS[m.current_status] ?? m.current_status,
    m.mileage, m.daily_price, m.weekly_price, m.monthly_price,
    m.soat_expiration, m.tecnomecanica_expiration, m.tax_expiration, m.next_oil_change_date,
  ]);
  return { filename: exportFilename("motos", now), csv: toCsv(headers, data) };
}

async function arrendatarios(now: Date): Promise<ExportResult> {
  const rows = await listCustomers();
  const headers = [
    "nombre", "tipo_documento", "documento", "nacionalidad", "telefono",
    "direccion", "licencia", "categoria_licencia", "estado",
  ];
  const data: CsvValue[][] = rows.map((c) => [
    c.full_name, c.document_type, c.document_number, c.nationality, c.phone,
    c.address, c.license_number, c.license_category, c.status,
  ]);
  return { filename: exportFilename("arrendatarios", now), csv: toCsv(headers, data) };
}

async function alquileres(now: Date): Promise<ExportResult> {
  const [rows, motoList, custList] = await Promise.all([
    listRentals(), listMotorcycles(), listCustomers(),
  ]);
  const motoMap = new Map(motoList.map((m) => [m.id, m]));
  const custMap = new Map(custList.map((c) => [c.id, c]));
  const headers = [
    "placa", "arrendatario", "fecha_inicio", "fecha_fin", "valor_acordado",
    "frecuencia_pago", "estado",
  ];
  const data: CsvValue[][] = rows.map((r) => [
    motoMap.get(r.motorcycle_id)?.plate ?? "",
    custMap.get(r.customer_id)?.full_name ?? "",
    r.start_date, r.end_date,
    r.agreed_value,
    PAYMENT_FREQUENCY_LABELS[r.payment_frequency] ?? r.payment_frequency,
    RENTAL_STATUS_LABELS[r.status] ?? r.status,
  ]);
  return { filename: exportFilename("alquileres", now), csv: toCsv(headers, data) };
}

async function pagos(now: Date): Promise<ExportResult> {
  const [rows, custList, rentalList, motoList] = await Promise.all([
    listPayments(), listCustomers(), listRentals(), listMotorcycles(),
  ]);
  const custMap = new Map(custList.map((c) => [c.id, c]));
  const rentalMap = new Map(rentalList.map((r) => [r.id, r]));
  const motoMap = new Map(motoList.map((m) => [m.id, m]));
  const headers = [
    "arrendatario", "alquiler_inicio", "placa", "monto", "metodo", "estado",
    "fecha_vencimiento", "fecha_pago", "referencia",
  ];
  const data: CsvValue[][] = rows.map((p) => {
    const rental = p.rental_id ? rentalMap.get(p.rental_id) : null;
    const plate = rental ? motoMap.get(rental.motorcycle_id)?.plate ?? "" : "";
    return [
      custMap.get(p.customer_id)?.full_name ?? "",
      rental?.start_date ?? "",
      plate,
      p.amount,
      PAYMENT_METHOD_LABELS[p.method] ?? p.method,
      PAYMENT_STATUS_LABELS[p.status] ?? p.status,
      p.due_date, p.paid_at, p.reference,
    ];
  });
  return { filename: exportFilename("pagos", now), csv: toCsv(headers, data) };
}

async function fotomultas(now: Date): Promise<ExportResult> {
  const [rows, motoList, custList] = await Promise.all([
    listFines(), listMotorcycles(), listCustomers(),
  ]);
  const motoMap = new Map(motoList.map((m) => [m.id, m]));
  const custMap = new Map(custList.map((c) => [c.id, c]));
  const headers = [
    "placa", "responsable", "fecha", "valor", "motivo", "ubicacion",
    "latitud", "longitud", "estado",
  ];
  const data: CsvValue[][] = rows.map((f) => [
    motoMap.get(f.motorcycle_id)?.plate ?? "",
    f.customer_id ? custMap.get(f.customer_id)?.full_name ?? "" : "",
    f.date, f.amount, f.reason, f.location_text, f.lat, f.lng,
    FINE_STATUS_LABELS[f.status] ?? f.status,
  ]);
  return { filename: exportFilename("fotomultas", now), csv: toCsv(headers, data) };
}

async function mantenimientos(now: Date): Promise<ExportResult> {
  const [rows, motoList] = await Promise.all([listMaintenance(), listMotorcycles()]);
  const motoMap = new Map(motoList.map((m) => [m.id, m]));
  const headers = [
    "placa", "tipo", "fecha", "kilometraje", "costo", "proxima_fecha",
    "proximo_kilometraje", "estado", "notas",
  ];
  const data: CsvValue[][] = rows.map((m) => [
    motoMap.get(m.motorcycle_id)?.plate ?? "",
    MAINTENANCE_TYPE_LABELS[m.type] ?? m.type,
    m.date, m.mileage, m.cost, m.next_date, m.next_mileage,
    MAINTENANCE_STATUS_LABELS[m.status] ?? m.status,
    m.notes,
  ]);
  return { filename: exportFilename("mantenimientos", now), csv: toCsv(headers, data) };
}
