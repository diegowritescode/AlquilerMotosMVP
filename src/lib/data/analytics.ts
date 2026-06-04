import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import type { ExpirationItem } from "../types";
import { daysUntil, parseDate } from "../utils";
import { listMotorcycles } from "./motorcycles";
import { listCustomers } from "./customers";
import { listRentals } from "./rentals";
import { listPayments } from "./payments";
import { listMaintenance } from "./maintenance";
import { listFines } from "./fines";

/**
 * Derived/aggregated read models for the dashboard, expirations and reports.
 *
 * These compute from the repository reads (not directly from any store), so the
 * SAME code serves both the Supabase and the in-memory demo paths.
 */

export interface DashboardStats {
  totalMotorcycles: number;
  rented: number;
  available: number;
  maintenance: number;
  inactive: number;
  incomeWeek: number;
  incomeMonth: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  upcomingExpirations: number; // next 15 days + overdue
  upcomingMaintenance: number; // next 7 days + overdue (programado)
}

function inRange(dateStr: string | null | undefined, from: Date, to: Date): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  return d >= from && d <= to;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [motos, payments, maintenance, expirations] = await Promise.all([
    listMotorcycles(),
    listPayments(),
    listMaintenance(),
    listExpirations(),
  ]);

  const now = new Date();
  const weekFrom = startOfWeek(now, { weekStartsOn: 1 });
  const weekTo = endOfWeek(now, { weekStartsOn: 1 });
  const monthFrom = startOfMonth(now);
  const monthTo = endOfMonth(now);

  const paidPayments = payments.filter((p) => p.status === "pagado" && p.paid_at);
  const incomeWeek = paidPayments
    .filter((p) => inRange(p.paid_at, weekFrom, weekTo))
    .reduce((sum, p) => sum + p.amount, 0);
  const incomeMonth = paidPayments
    .filter((p) => inRange(p.paid_at, monthFrom, monthTo))
    .reduce((sum, p) => sum + p.amount, 0);

  const pending = payments.filter(
    (p) =>
      p.status === "pendiente" ||
      p.status === "vencido" ||
      p.status === "parcial" ||
      p.status === "en_acuerdo",
  );

  const upcomingExpirations = expirations.filter(
    (e) => e.kind !== "pago" && e.daysLeft <= 15,
  ).length;

  const upcomingMaintenance = maintenance.filter((m) => {
    if (m.status === "realizado") return false;
    const d = daysUntil(m.next_date);
    return d !== null && d <= 7;
  }).length;

  return {
    totalMotorcycles: motos.length,
    rented: motos.filter((m) => m.current_status === "alquilada").length,
    available: motos.filter((m) => m.current_status === "disponible").length,
    maintenance: motos.filter((m) => m.current_status === "mantenimiento").length,
    inactive: motos.filter((m) => m.current_status === "inactiva").length,
    incomeWeek,
    incomeMonth,
    pendingPaymentsCount: pending.length,
    pendingPaymentsAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    upcomingExpirations,
    upcomingMaintenance,
  };
}

/**
 * Build a unified list of upcoming/overdue expirations across documents,
 * oil changes, scheduled maintenance and pending payments.
 */
export async function listExpirations(): Promise<ExpirationItem[]> {
  const [motos, maintenance, payments, customers] = await Promise.all([
    listMotorcycles(),
    listMaintenance(),
    listPayments(),
    listCustomers(),
  ]);
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const items: ExpirationItem[] = [];

  const pushDoc = (
    motoId: string,
    label: string,
    plate: string,
    kind: ExpirationItem["kind"],
    date?: string | null,
  ) => {
    if (!date) return;
    const d = daysUntil(date);
    if (d === null) return;
    items.push({
      id: `${kind}-${motoId}`,
      kind,
      title: label,
      subtitle: plate,
      date,
      daysLeft: d,
      motorcycleId: motoId,
    });
  };

  for (const m of motos) {
    const plate = `${m.brand} ${m.model} · ${m.plate}`;
    pushDoc(m.id, "SOAT", plate, "soat", m.soat_expiration);
    pushDoc(m.id, "Tecnomecánica", plate, "tecnomecanica", m.tecnomecanica_expiration);
    pushDoc(m.id, "Impuestos", plate, "impuestos", m.tax_expiration);
    pushDoc(m.id, "Cambio de aceite", plate, "cambio_aceite", m.next_oil_change_date);
  }

  // Scheduled maintenance with a next_date.
  for (const rec of maintenance) {
    if (rec.status === "realizado" || !rec.next_date) continue;
    const d = daysUntil(rec.next_date);
    if (d === null) continue;
    const moto = motos.find((m) => m.id === rec.motorcycle_id);
    items.push({
      id: `mant-${rec.id}`,
      kind: "mantenimiento",
      title: "Mantenimiento programado",
      subtitle: moto ? `${moto.brand} ${moto.model} · ${moto.plate}` : "Moto",
      date: rec.next_date,
      daysLeft: d,
      motorcycleId: rec.motorcycle_id,
    });
  }

  // Pending / overdue payments.
  for (const p of payments) {
    if (!(p.status === "pendiente" || p.status === "vencido")) continue;
    if (!p.due_date) continue;
    const d = daysUntil(p.due_date);
    if (d === null) continue;
    const customer = customerMap.get(p.customer_id);
    items.push({
      id: `pago-${p.id}`,
      kind: "pago",
      title: "Pago de alquiler",
      subtitle: customer?.full_name ?? "Cliente",
      date: p.due_date,
      daysLeft: d,
      customerId: p.customer_id,
      amount: p.amount,
    });
  }

  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

export interface ReportData {
  incomeTotal: number;
  incomeWeek: number;
  incomeMonth: number;
  pendingAmount: number;
  pendingCount: number;
  motosByStatus: Record<string, number>;
  maintenancePending: number;
  finesPending: number;
  finesPendingAmount: number;
  activeCustomers: number;
  utilization: { rented: number; total: number; percent: number };
}

export async function getReportData(): Promise<ReportData> {
  const [stats, motos, payments, maintenance, fines, rentals] = await Promise.all([
    getDashboardStats(),
    listMotorcycles(),
    listPayments(),
    listMaintenance(),
    listFines(),
    listRentals(),
  ]);

  const incomeTotal = payments
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + p.amount, 0);

  const motosByStatus = motos.reduce<Record<string, number>>((acc, m) => {
    acc[m.current_status] = (acc[m.current_status] ?? 0) + 1;
    return acc;
  }, {});

  const maintenancePending = maintenance.filter((m) => m.status !== "realizado").length;

  const pendingFines = fines.filter(
    (f) => f.status === "pendiente" || f.status === "en_disputa",
  );

  const activeCustomers = new Set(
    rentals.filter((r) => r.status === "activo").map((r) => r.customer_id),
  ).size;

  const total = motos.length || 1;
  const rented = stats.rented;

  return {
    incomeTotal,
    incomeWeek: stats.incomeWeek,
    incomeMonth: stats.incomeMonth,
    pendingAmount: stats.pendingPaymentsAmount,
    pendingCount: stats.pendingPaymentsCount,
    motosByStatus,
    maintenancePending,
    finesPending: pendingFines.length,
    finesPendingAmount: pendingFines.reduce((s, f) => s + f.amount, 0),
    activeCustomers,
    utilization: {
      rented,
      total: motos.length,
      percent: Math.round((rented / total) * 100),
    },
  };
}
