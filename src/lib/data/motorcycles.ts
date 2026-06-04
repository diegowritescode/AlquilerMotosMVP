import type { Motorcycle, MotorcycleStatus } from "../types";
import type { MotorcycleInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap } from "./db";

const TABLE = "motorcycles";
const active = (m: Motorcycle) => !m.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listMotorcycles(opts?: {
  search?: string;
  status?: MotorcycleStatus | "todas";
}): Promise<Motorcycle[]> {
  const supabase = getDataClient();
  if (!supabase) return listMotorcyclesMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.status && opts.status !== "todas") {
    query = query.eq("current_status", opts.status);
  }
  if (opts?.search) {
    const q = opts.search.trim();
    query = query.or(
      `plate.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%`,
    );
  }
  const res = await query.order("brand", { ascending: true });
  return unwrap(res, "listMotorcycles") as Motorcycle[];
}

export async function getMotorcycle(id: string): Promise<Motorcycle | null> {
  const supabase = getDataClient();
  if (!supabase) return getMotorcycleMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getMotorcycle") as Motorcycle | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createMotorcycle(
  input: MotorcycleInput,
): Promise<Motorcycle> {
  const supabase = getDataClient();
  if (!supabase) return createMotorcycleMock(input);
  const res = await supabase.from(TABLE).insert(input).select().single();
  return unwrap(res, "createMotorcycle") as Motorcycle;
}

export async function updateMotorcycle(
  id: string,
  input: Partial<MotorcycleInput>,
): Promise<Motorcycle | null> {
  const supabase = getDataClient();
  if (!supabase) return updateMotorcycleMock(id, input);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updateMotorcycle") as Motorcycle | null) ?? null;
}

/** Logical delete -> mark inactive + set deleted_at. */
export async function deleteMotorcycle(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return deleteMotorcycleMock(id);
  const res = await supabase
    .from(TABLE)
    .update({
      current_status: "inactiva",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteMotorcycle"));
}

/** Internal helper used by rentals to flip the moto status. */
export async function setMotorcycleStatus(
  id: string,
  status: MotorcycleStatus,
): Promise<void> {
  const supabase = getDataClient();
  if (!supabase) return setMotorcycleStatusMock(id, status);
  const res = await supabase
    .from(TABLE)
    .update({ current_status: status })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  unwrap(res, "setMotorcycleStatus");
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listMotorcyclesMock(opts?: {
  search?: string;
  status?: MotorcycleStatus | "todas";
}): Motorcycle[] {
  const db = getMockDB();
  let rows = db.motorcycles.filter(active);
  if (opts?.status && opts.status !== "todas") {
    rows = rows.filter((m) => m.current_status === opts.status);
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase().trim();
    rows = rows.filter(
      (m) =>
        m.plate.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => a.brand.localeCompare(b.brand));
}

function getMotorcycleMock(id: string): Motorcycle | null {
  const db = getMockDB();
  return db.motorcycles.find((m) => m.id === id && active(m)) ?? null;
}

function createMotorcycleMock(input: MotorcycleInput): Motorcycle {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const moto: Motorcycle = {
    id: uuid(),
    ...input,
    notes: input.notes ?? null,
    soat_expiration: input.soat_expiration ?? null,
    tecnomecanica_expiration: input.tecnomecanica_expiration ?? null,
    tax_expiration: input.tax_expiration ?? null,
    next_oil_change_date: input.next_oil_change_date ?? null,
    next_oil_change_mileage: input.next_oil_change_mileage ?? null,
    photo_url: input.photo_url ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.motorcycles.unshift(moto);
  return moto;
}

function updateMotorcycleMock(
  id: string,
  input: Partial<MotorcycleInput>,
): Motorcycle | null {
  const db = getMockDB();
  const idx = db.motorcycles.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const current = db.motorcycles[idx]!;
  const updated: Motorcycle = {
    ...current,
    ...input,
    updated_at: new Date().toISOString(),
  };
  db.motorcycles[idx] = updated;
  return updated;
}

function deleteMotorcycleMock(id: string): boolean {
  const db = getMockDB();
  const idx = db.motorcycles.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  const current = db.motorcycles[idx]!;
  db.motorcycles[idx] = {
    ...current,
    current_status: "inactiva",
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return true;
}

function setMotorcycleStatusMock(id: string, status: MotorcycleStatus): void {
  const db = getMockDB();
  const idx = db.motorcycles.findIndex((m) => m.id === id);
  if (idx === -1) return;
  db.motorcycles[idx] = {
    ...db.motorcycles[idx]!,
    current_status: status,
    updated_at: new Date().toISOString(),
  };
}
