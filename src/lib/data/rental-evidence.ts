import { getDataClient, unwrap, unwrapListSafe } from "./db";

/**
 * Repository for `rental_evidence` — delivery/return photos & support files for
 * a rental. Stores the Storage PATH in `file_path` (private bucket; signed URLs
 * generated on read). Demo mode returns [] and no-ops writes.
 */
export type RentalEvidenceType = "delivery" | "return" | "other";

export interface RentalEvidence {
  id: string;
  rental_id: string;
  type: RentalEvidenceType;
  file_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  notes: string | null;
  created_at: string;
  deleted_at: string | null;
}

const TABLE = "rental_evidence";

export async function listRentalEvidence(
  rentalId: string,
  type?: RentalEvidenceType,
): Promise<RentalEvidence[]> {
  const supabase = getDataClient();
  if (!supabase) return [];
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("rental_id", rentalId)
    .is("deleted_at", null);
  if (type) query = query.eq("type", type);
  const res = await query.order("created_at", { ascending: false });
  return unwrapListSafe<RentalEvidence>(res, "listRentalEvidence");
}

export async function createRentalEvidence(input: {
  rental_id: string;
  type: RentalEvidenceType;
  file_path: string;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
}): Promise<RentalEvidence | null> {
  const supabase = getDataClient();
  if (!supabase) return null;
  const res = await supabase
    .from(TABLE)
    .insert({
      rental_id: input.rental_id,
      type: input.type,
      file_path: input.file_path,
      file_name: input.file_name ?? null,
      mime_type: input.mime_type ?? null,
      size_bytes: input.size_bytes ?? null,
    })
    .select()
    .single();
  return unwrap(res, "createRentalEvidence") as RentalEvidence;
}

export async function deleteRentalEvidence(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return false;
  const res = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteRentalEvidence"));
}
