import { getDataClient, unwrap, unwrapListSafe } from "./db";

/**
 * Repository for `rental_contracts` — generated PDF actas for a rental,
 * versioned. Stores the Storage PATH in `file_path`. Demo mode returns null/[].
 */
export interface RentalContract {
  id: string;
  rental_id: string;
  file_path: string;
  file_name: string | null;
  version: number;
  generated_at: string;
  generated_by: string | null;
  notes: string | null;
}

const TABLE = "rental_contracts";

export async function listRentalContracts(
  rentalId: string,
): Promise<RentalContract[]> {
  const supabase = getDataClient();
  if (!supabase) return [];
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("rental_id", rentalId)
    .order("version", { ascending: false });
  return unwrapListSafe<RentalContract>(res, "listRentalContracts");
}

/** Latest contract version for a rental, or null. */
export async function latestRentalContract(
  rentalId: string,
): Promise<RentalContract | null> {
  const all = await listRentalContracts(rentalId);
  return all[0] ?? null;
}

export async function createRentalContract(input: {
  rental_id: string;
  file_path: string;
  file_name?: string | null;
  version: number;
}): Promise<RentalContract | null> {
  const supabase = getDataClient();
  if (!supabase) return null;
  const res = await supabase
    .from(TABLE)
    .insert({
      rental_id: input.rental_id,
      file_path: input.file_path,
      file_name: input.file_name ?? null,
      version: input.version,
    })
    .select()
    .single();
  return unwrap(res, "createRentalContract") as RentalContract;
}
