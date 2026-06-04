import { getDataClient, unwrap, unwrapListSafe } from "./db";

/**
 * Repository for `motorcycle_photos`. We store the Storage PATH (bucket-relative)
 * in the `file_url` column and generate signed URLs on read (the bucket is
 * private). Column name kept for backward compatibility — see docs/storage.md.
 *
 * Demo mode (no Supabase) returns an empty list and no-ops writes, since there
 * is no Storage available.
 */
export interface MotorcyclePhoto {
  id: string;
  motorcycle_id: string;
  file_url: string; // storage path
  photo_type: string | null;
  created_at: string;
}

const TABLE = "motorcycle_photos";

export async function listMotorcyclePhotos(
  motorcycleId: string,
): Promise<MotorcyclePhoto[]> {
  const supabase = getDataClient();
  if (!supabase) return [];
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("created_at", { ascending: false });
  return unwrapListSafe<MotorcyclePhoto>(res, "listMotorcyclePhotos");
}

export async function createMotorcyclePhoto(input: {
  motorcycle_id: string;
  file_url: string;
  photo_type?: string | null;
}): Promise<MotorcyclePhoto | null> {
  const supabase = getDataClient();
  if (!supabase) return null;
  const res = await supabase
    .from(TABLE)
    .insert({
      motorcycle_id: input.motorcycle_id,
      file_url: input.file_url,
      photo_type: input.photo_type ?? null,
    })
    .select()
    .single();
  return unwrap(res, "createMotorcyclePhoto") as MotorcyclePhoto;
}

export async function deleteMotorcyclePhoto(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return false;
  const res = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteMotorcyclePhoto"));
}
