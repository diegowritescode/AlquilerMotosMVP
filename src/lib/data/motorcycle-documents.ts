import { getDataClient, unwrap } from "./db";

/**
 * Repository for `motorcycle_documents` — per-document files (SOAT,
 * tecnomecánica, impuestos) stored in Supabase Storage. In Fase 1 the moto's
 * expiration dates live as columns on `motorcycles` (used by the expirations
 * view); this table is the prepared home for the actual file attachments and
 * their own expiration tracking.
 *
 * Demo mode keeps no separate store for these; it returns an empty list so the
 * UI stays consistent without crashing.
 */
export interface MotorcycleDocument {
  id: string;
  motorcycle_id: string;
  type: "soat" | "tecnomecanica" | "impuestos";
  expiration_date: string | null;
  file_url: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = "motorcycle_documents";

export async function listMotorcycleDocuments(
  motorcycleId: string,
): Promise<MotorcycleDocument[]> {
  const supabase = getDataClient();
  if (!supabase) return [];
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("expiration_date", { ascending: true, nullsFirst: false });
  return unwrap(res, "listMotorcycleDocuments") as MotorcycleDocument[];
}

export async function createMotorcycleDocument(input: {
  motorcycle_id: string;
  type: MotorcycleDocument["type"];
  expiration_date?: string | null;
  file_url?: string | null;
  status?: string | null;
}): Promise<MotorcycleDocument | null> {
  const supabase = getDataClient();
  if (!supabase) return null;
  const res = await supabase
    .from(TABLE)
    .insert({
      motorcycle_id: input.motorcycle_id,
      type: input.type,
      expiration_date: input.expiration_date ?? null,
      file_url: input.file_url ?? null,
      status: input.status ?? "vigente",
    })
    .select()
    .single();
  return unwrap(res, "createMotorcycleDocument") as MotorcycleDocument;
}

export async function deleteMotorcycleDocument(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return false;
  const res = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteMotorcycleDocument"));
}
