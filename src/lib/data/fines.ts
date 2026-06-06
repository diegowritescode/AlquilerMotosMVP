import type { Fine, FineStatus } from "../types";
import type { FineInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap } from "./db";

const TABLE = "fines";
const active = (f: Fine) => !f.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listFines(opts?: {
  status?: FineStatus | "todos";
  motorcycleId?: string;
  customerId?: string;
}): Promise<Fine[]> {
  const supabase = getDataClient();
  if (!supabase) return listFinesMock(opts);

  let query = supabase.from(TABLE).select("*").is("deleted_at", null);
  if (opts?.status && opts.status !== "todos") query = query.eq("status", opts.status);
  if (opts?.motorcycleId) query = query.eq("motorcycle_id", opts.motorcycleId);
  if (opts?.customerId) query = query.eq("customer_id", opts.customerId);
  const res = await query.order("date", { ascending: false });
  return unwrap(res, "listFines") as Fine[];
}

export async function getFine(id: string): Promise<Fine | null> {
  const supabase = getDataClient();
  if (!supabase) return getFineMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getFine") as Fine | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createFine(input: FineInput): Promise<Fine> {
  const supabase = getDataClient();
  if (!supabase) return createFineMock(input);
  // Omit camera_id when unset so the insert stays compatible with databases
  // where the optional `camera_id` column has not been added yet (migration
  // 0006). It is included only when a camera was actually linked.
  const { camera_id, ...rest } = input;
  const payload: Record<string, unknown> = {
    ...rest,
    customer_id: input.customer_id ?? null,
    rental_id: input.rental_id ?? null,
  };
  if (camera_id) payload.camera_id = camera_id;
  const res = await supabase.from(TABLE).insert(payload).select().single();
  return unwrap(res, "createFine") as Fine;
}

export async function updateFine(
  id: string,
  input: Partial<FineInput>,
): Promise<Fine | null> {
  const supabase = getDataClient();
  if (!supabase) return updateFineMock(id, input);
  // See createFine: only send camera_id when linking to a camera.
  const { camera_id, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest };
  if (camera_id) payload.camera_id = camera_id;
  const res = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updateFine") as Fine | null) ?? null;
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listFinesMock(opts?: {
  status?: FineStatus | "todos";
  motorcycleId?: string;
  customerId?: string;
}): Fine[] {
  const db = getMockDB();
  let rows = db.fines.filter(active);
  if (opts?.status && opts.status !== "todos") rows = rows.filter((f) => f.status === opts.status);
  if (opts?.motorcycleId) rows = rows.filter((f) => f.motorcycle_id === opts.motorcycleId);
  if (opts?.customerId) rows = rows.filter((f) => f.customer_id === opts.customerId);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function getFineMock(id: string): Fine | null {
  const db = getMockDB();
  return db.fines.find((f) => f.id === id && active(f)) ?? null;
}

function createFineMock(input: FineInput): Fine {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const fine: Fine = {
    id: uuid(),
    motorcycle_id: input.motorcycle_id,
    customer_id: input.customer_id ?? null,
    rental_id: input.rental_id ?? null,
    date: input.date,
    amount: input.amount,
    reason: input.reason,
    location_text: input.location_text ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    status: input.status,
    evidence_url: input.evidence_url ?? null,
    notes: input.notes ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.fines.unshift(fine);
  return fine;
}

function updateFineMock(id: string, input: Partial<FineInput>): Fine | null {
  const db = getMockDB();
  const idx = db.fines.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  db.fines[idx] = {
    ...db.fines[idx]!,
    ...input,
    updated_at: new Date().toISOString(),
  };
  return db.fines[idx]!;
}
