import { getDataClient, unwrap, unwrapListSafe } from "./db";

/**
 * Repository for `customer_documents`. Stores the Storage PATH in `file_url`
 * (bucket is private; signed URLs generated on read). `type` is the document
 * kind. Demo mode returns [] and no-ops writes.
 *
 * NOTE: customer documents are SENSITIVE personal data — see docs/storage.md
 * and the privacy policy. Bucket is private and access is admin-only.
 */
export const CUSTOMER_DOCUMENT_TYPES = [
  "foto_frontal",
  "licencia",
  "documento_identidad",
  "otro",
] as const;
export type CustomerDocumentType = (typeof CUSTOMER_DOCUMENT_TYPES)[number];

export const CUSTOMER_DOCUMENT_LABELS: Record<string, string> = {
  foto_frontal: "Foto frontal",
  licencia: "Licencia de conducción",
  documento_identidad: "Documento de identidad",
  otro: "Otro",
};

export interface CustomerDocument {
  id: string;
  customer_id: string;
  type: string;
  file_url: string; // storage path
  expiration_date: string | null;
  verified_at: string | null;
  created_at: string;
}

const TABLE = "customer_documents";

export async function listCustomerDocuments(
  customerId: string,
): Promise<CustomerDocument[]> {
  const supabase = getDataClient();
  if (!supabase) return [];
  const res = await supabase
    .from(TABLE)
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return unwrapListSafe<CustomerDocument>(res, "listCustomerDocuments");
}

export async function createCustomerDocument(input: {
  customer_id: string;
  type: string;
  file_url: string;
}): Promise<CustomerDocument | null> {
  const supabase = getDataClient();
  if (!supabase) return null;
  const res = await supabase
    .from(TABLE)
    .insert({
      customer_id: input.customer_id,
      type: input.type,
      file_url: input.file_url,
    })
    .select()
    .single();
  return unwrap(res, "createCustomerDocument") as CustomerDocument;
}

export async function deleteCustomerDocument(id: string): Promise<boolean> {
  const supabase = getDataClient();
  if (!supabase) return false;
  const res = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  return Boolean(unwrap(res, "deleteCustomerDocument"));
}
