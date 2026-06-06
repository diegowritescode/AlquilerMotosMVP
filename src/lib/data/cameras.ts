import type { TrafficCamera } from "../types";
import type { TrafficCameraInput } from "../schemas";
import { getMockDB } from "../mock/store";
import { uuid } from "../utils";
import { getDataClient, unwrap, unwrapListSafe } from "./db";

const TABLE = "traffic_cameras";
const active = (c: TrafficCamera) => !c.deleted_at;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listCameras(): Promise<TrafficCamera[]> {
  const supabase = getDataClient();
  if (!supabase) return listCamerasMock();
  const res = await supabase
    .from(TABLE)
    .select("*")
    .is("deleted_at", null)
    .order("zone", { ascending: true })
    .order("name", { ascending: true });
  // Optional table: tolerate "not migrated yet" without crashing the page.
  return unwrapListSafe(res, "listCameras") as TrafficCamera[];
}

export async function getCamera(id: string): Promise<TrafficCamera | null> {
  const supabase = getDataClient();
  if (!supabase) return getCameraMock(id);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (unwrap(res, "getCamera") as TrafficCamera | null) ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createCamera(input: TrafficCameraInput): Promise<TrafficCamera> {
  const supabase = getDataClient();
  if (!supabase) return createCameraMock(input);
  const res = await supabase.from(TABLE).insert(input).select().single();
  return unwrap(res, "createCamera") as TrafficCamera;
}

export async function updateCamera(
  id: string,
  input: Partial<TrafficCameraInput>,
): Promise<TrafficCamera | null> {
  const supabase = getDataClient();
  if (!supabase) return updateCameraMock(id, input);
  const res = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  return (unwrap(res, "updateCamera") as TrafficCamera | null) ?? null;
}

/** Logical delete -> set deleted_at. */
export async function deleteCamera(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return deleteCameraMock(id);
  const res = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteCamera"));
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function listCamerasMock(): TrafficCamera[] {
  const db = getMockDB();
  return db.cameras
    .filter(active)
    .sort((a, b) => (a.zone ?? "").localeCompare(b.zone ?? "") || a.name.localeCompare(b.name));
}

function getCameraMock(id: string): TrafficCamera | null {
  const db = getMockDB();
  return db.cameras.find((c) => c.id === id && active(c)) ?? null;
}

function createCameraMock(input: TrafficCameraInput): TrafficCamera {
  const db = getMockDB();
  const nowIso = new Date().toISOString();
  const camera: TrafficCamera = {
    id: uuid(),
    name: input.name,
    type: input.type,
    lat: input.lat,
    lng: input.lng,
    zone: input.zone ?? null,
    max_speed_kmh: input.max_speed_kmh ?? null,
    approximate: input.approximate ?? true,
    source: input.source ?? null,
    notes: input.notes ?? null,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  };
  db.cameras.unshift(camera);
  return camera;
}

function updateCameraMock(
  id: string,
  input: Partial<TrafficCameraInput>,
): TrafficCamera | null {
  const db = getMockDB();
  const idx = db.cameras.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.cameras[idx] = {
    ...db.cameras[idx]!,
    ...input,
    updated_at: new Date().toISOString(),
  };
  return db.cameras[idx]!;
}

function deleteCameraMock(id: string): boolean {
  const db = getMockDB();
  const idx = db.cameras.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.cameras[idx] = { ...db.cameras[idx]!, deleted_at: new Date().toISOString() };
  return true;
}
