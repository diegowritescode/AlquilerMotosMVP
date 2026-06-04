import type { MaintenanceRecord, MaintenanceStatus } from "../types";
import type { MaintenanceInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap } from "./db";

const TABLE = "maintenance_records";
const active = (m: MaintenanceRecord) => !m.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listMaintenance(opts?: {
  status?: MaintenanceStatus | "todos";
  motorcycleId?: string;
}): Promise<MaintenanceRecord[]> {
  const supabase = getDataClient();
  if (!supabase) return listMaintenanceMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.status && opts.status !== "todos") query = query.eq("status", opts.status);
  if (opts?.motorcycleId) query = query.eq("motorcycle_id", opts.motorcycleId);
  const res = await query.order("date", { ascending: false });
  return unwrap(res, "listMaintenance") as MaintenanceRecord[];
}

export async function getMaintenance(
  id: string,
): Promise<MaintenanceRecord | null> {
  const supabase = getDataClient();
  if (!supabase) return getMaintenanceMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getMaintenance") as MaintenanceRecord | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createMaintenance(
  input: MaintenanceInput,
): Promise<MaintenanceRecord> {
  const supabase = getDataClient();
  if (!supabase) return createMaintenanceMock(input);
  const res = await supabase.from(TABLE).insert(input).select().single();
  return unwrap(res, "createMaintenance") as MaintenanceRecord;
}

export async function updateMaintenance(
  id: string,
  input: Partial<MaintenanceInput>,
): Promise<MaintenanceRecord | null> {
  const supabase = getDataClient();
  if (!supabase) return updateMaintenanceMock(id, input);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updateMaintenance") as MaintenanceRecord | null) ?? null;
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listMaintenanceMock(opts?: {
  status?: MaintenanceStatus | "todos";
  motorcycleId?: string;
}): MaintenanceRecord[] {
  const db = getMockDB();
  let rows = db.maintenance.filter(active);
  if (opts?.status && opts.status !== "todos") rows = rows.filter((m) => m.status === opts.status);
  if (opts?.motorcycleId) rows = rows.filter((m) => m.motorcycle_id === opts.motorcycleId);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function getMaintenanceMock(id: string): MaintenanceRecord | null {
  const db = getMockDB();
  return db.maintenance.find((m) => m.id === id && active(m)) ?? null;
}

function createMaintenanceMock(input: MaintenanceInput): MaintenanceRecord {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const record: MaintenanceRecord = {
    id: uuid(),
    motorcycle_id: input.motorcycle_id,
    type: input.type,
    date: input.date,
    mileage: input.mileage ?? null,
    cost: input.cost ?? null,
    next_date: input.next_date ?? null,
    next_mileage: input.next_mileage ?? null,
    status: input.status,
    notes: input.notes ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.maintenance.unshift(record);
  return record;
}

function updateMaintenanceMock(
  id: string,
  input: Partial<MaintenanceInput>,
): MaintenanceRecord | null {
  const db = getMockDB();
  const idx = db.maintenance.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  db.maintenance[idx] = {
    ...db.maintenance[idx]!,
    ...input,
    updated_at: new Date().toISOString(),
  };
  return db.maintenance[idx]!;
}
