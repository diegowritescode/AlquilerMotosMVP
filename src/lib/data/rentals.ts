import type { Rental } from "../types";
import type { RentalInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { todayISO, uuid } from "../utils";
import { getDataClient, unwrap } from "./db";
import { setMotorcycleStatus } from "./motorcycles";

const TABLE = "rentals";
const active = (r: Rental) => !r.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listRentals(opts?: {
  status?: Rental["status"] | "todos";
  customerId?: string;
  motorcycleId?: string;
}): Promise<Rental[]> {
  const supabase = getDataClient();
  if (!supabase) return listRentalsMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.status && opts.status !== "todos") query = query.eq("status", opts.status);
  if (opts?.customerId) query = query.eq("customer_id", opts.customerId);
  if (opts?.motorcycleId) query = query.eq("motorcycle_id", opts.motorcycleId);
  const res = await query.order("start_date", { ascending: false });
  return unwrap(res, "listRentals") as Rental[];
}

export async function getRental(id: string): Promise<Rental | null> {
  const supabase = getDataClient();
  if (!supabase) return getRentalMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getRental") as Rental | null) ?? null;
}

/** True if the motorcycle already has an active rental (excluding `exceptId`). */
export async function hasActiveRental(
  motorcycleId: string,
  exceptId?: string,
): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return hasActiveRentalMock(motorcycleId, exceptId);
  let query = supabase
    .from(TABLE)
    .select("id")
    .eq("motorcycle_id", motorcycleId)
    .eq("status", "activo")
    .is("deleted_at", null);
  if (exceptId) query = query.neq("id", exceptId);
  const res = await query;
  const rows = unwrap(res, "hasActiveRental") as { id: string }[];
  return rows.length > 0;
}

/** The active rental for a moto on a given date (used by fines suggestion). */
export async function rentalForMotorcycleOnDate(
  motorcycleId: string,
  date: string,
): Promise<Rental | null> {
  const supabase = getDataClient();
  if (!supabase) return rentalForMotorcycleOnDateMock(motorcycleId, date);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .is("deleted_at", null)
    .lte("start_date", date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    .order("start_date", { ascending: false });
  const rows = unwrap(res, "rentalForMotorcycleOnDate") as Rental[];
  return rows.find((r) => r.status === "activo") ?? rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Writes (with business rules)
// ---------------------------------------------------------------------------

export async function createRental(input: RentalInput): Promise<Rental> {
  const supabase = getDataClient();
  if (!supabase) return createRentalMock(input);

  const payload = {
    customer_id: input.customer_id,
    motorcycle_id: input.motorcycle_id,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    agreed_value: input.agreed_value,
    payment_frequency: input.payment_frequency,
    payment_day: input.payment_day ?? null,
    status: input.status,
    terms_accepted_at: input.status === "activo" ? new Date().toISOString() : null,
    notes: input.notes ?? null,
  };
  const res = await supabase.from(TABLE).insert(payload).select().single();
  const rental = unwrap(res, "createRental") as Rental;

  // Business rule: an active rental flips the moto to "alquilada".
  if (rental.status === "activo") {
    await setMotorcycleStatus(rental.motorcycle_id, "alquilada");
  }
  return rental;
}

export async function updateRental(
  id: string,
  input: Partial<RentalInput>,
): Promise<Rental | null> {
  const supabase = getDataClient();
  if (!supabase) return updateRentalMock(id, input);

  const prev = await getRental(id);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  const updated = (unwrap(res, "updateRental") as Rental | null) ?? null;
  if (!updated) return null;

  if (prev && prev.status !== updated.status && updated.status === "activo") {
    await setMotorcycleStatus(updated.motorcycle_id, "alquilada");
  }
  return updated;
}

/** Finalize a rental and decide the resulting moto status. */
export async function finalizeRental(
  id: string,
  nextMotorcycleStatus: "disponible" | "mantenimiento",
): Promise<Rental | null> {
  const supabase = getDataClient();
  if (!supabase) return finalizeRentalMock(id, nextMotorcycleStatus);

  const prev = await getRental(id);
  if (!prev) return null;
  const res = await supabase
    .from(TABLE)
    .update({
      status: "finalizado",
      end_date: prev.end_date ?? todayISO(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  const updated = (unwrap(res, "finalizeRental") as Rental | null) ?? null;
  if (!updated) return null;
  await setMotorcycleStatus(updated.motorcycle_id, nextMotorcycleStatus);
  return updated;
}

/** Change status (cancel, mark vencido, etc.) and reconcile moto state. */
export async function changeRentalStatus(
  id: string,
  status: Rental["status"],
): Promise<Rental | null> {
  const supabase = getDataClient();
  if (!supabase) return changeRentalStatusMock(id, status);

  const prev = await getRental(id);
  if (!prev) return null;
  const res = await supabase
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  const updated = (unwrap(res, "changeRentalStatus") as Rental | null) ?? null;
  if (!updated) return null;

  if (status === "activo") {
    await setMotorcycleStatus(updated.motorcycle_id, "alquilada");
  } else if (
    (status === "cancelado" || status === "finalizado") &&
    prev.status === "activo"
  ) {
    await setMotorcycleStatus(updated.motorcycle_id, "disponible");
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listRentalsMock(opts?: {
  status?: Rental["status"] | "todos";
  customerId?: string;
  motorcycleId?: string;
}): Rental[] {
  const db = getMockDB();
  let rows = db.rentals.filter(active);
  if (opts?.status && opts.status !== "todos") rows = rows.filter((r) => r.status === opts.status);
  if (opts?.customerId) rows = rows.filter((r) => r.customer_id === opts.customerId);
  if (opts?.motorcycleId) rows = rows.filter((r) => r.motorcycle_id === opts.motorcycleId);
  return rows.sort((a, b) => b.start_date.localeCompare(a.start_date));
}

function getRentalMock(id: string): Rental | null {
  const db = getMockDB();
  return db.rentals.find((r) => r.id === id && active(r)) ?? null;
}

function hasActiveRentalMock(motorcycleId: string, exceptId?: string): boolean {
  const db = getMockDB();
  return db.rentals.some(
    (r) =>
      active(r) &&
      r.motorcycle_id === motorcycleId &&
      r.status === "activo" &&
      r.id !== exceptId,
  );
}

function createRentalMock(input: RentalInput): Rental {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const rental: Rental = {
    id: uuid(),
    customer_id: input.customer_id,
    motorcycle_id: input.motorcycle_id,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    agreed_value: input.agreed_value,
    payment_frequency: input.payment_frequency,
    payment_day: input.payment_day ?? null,
    status: input.status,
    terms_accepted_at: input.status === "activo" ? nowIso : null,
    notes: input.notes ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.rentals.unshift(rental);
  if (rental.status === "activo") {
    void setMotorcycleStatus(rental.motorcycle_id, "alquilada");
  }
  return rental;
}

function updateRentalMock(id: string, input: Partial<RentalInput>): Rental | null {
  const db = getMockDB();
  const idx = db.rentals.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const prev = db.rentals[idx]!;
  const updated: Rental = { ...prev, ...input, updated_at: new Date().toISOString() };
  db.rentals[idx] = updated;
  if (prev.status !== updated.status && updated.status === "activo") {
    void setMotorcycleStatus(updated.motorcycle_id, "alquilada");
  }
  return updated;
}

function finalizeRentalMock(
  id: string,
  nextMotorcycleStatus: "disponible" | "mantenimiento",
): Rental | null {
  const db = getMockDB();
  const idx = db.rentals.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: Rental = {
    ...db.rentals[idx]!,
    status: "finalizado",
    end_date: db.rentals[idx]!.end_date ?? todayISO(),
    updated_at: new Date().toISOString(),
  };
  db.rentals[idx] = updated;
  void setMotorcycleStatus(updated.motorcycle_id, nextMotorcycleStatus);
  return updated;
}

function changeRentalStatusMock(id: string, status: Rental["status"]): Rental | null {
  const db = getMockDB();
  const idx = db.rentals.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const prev = db.rentals[idx]!;
  const updated: Rental = { ...prev, status, updated_at: new Date().toISOString() };
  db.rentals[idx] = updated;
  if (status === "activo") {
    void setMotorcycleStatus(updated.motorcycle_id, "alquilada");
  } else if ((status === "cancelado" || status === "finalizado") && prev.status === "activo") {
    void setMotorcycleStatus(updated.motorcycle_id, "disponible");
  }
  return updated;
}

function rentalForMotorcycleOnDateMock(
  motorcycleId: string,
  date: string,
): Rental | null {
  const db = getMockDB();
  const candidates = db.rentals.filter(
    (r) =>
      active(r) &&
      r.motorcycle_id === motorcycleId &&
      r.start_date <= date &&
      (!r.end_date || r.end_date >= date),
  );
  return (
    candidates.find((r) => r.status === "activo") ??
    candidates.sort((a, b) => b.start_date.localeCompare(a.start_date))[0] ??
    null
  );
}
