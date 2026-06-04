import { createSupabaseBrowserClient } from "./supabase/client";

/**
 * Supabase Storage helpers (prepared for Fase 1; uploads activate once
 * Supabase is configured). Buckets — create these in your Supabase project,
 * all PRIVATE (whitepaper §16.2 requires private storage + signed URLs):
 *
 *   - motorcycle-photos
 *   - customer-documents
 *   - payment-evidence
 *   - fine-evidence
 */
export const STORAGE_BUCKETS = {
  motorcyclePhotos: "motorcycle-photos",
  customerDocuments: "customer-documents",
  paymentEvidence: "payment-evidence",
  fineEvidence: "fine-evidence",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

/**
 * Upload a file to a bucket from the browser. Returns the storage path on
 * success. In demo mode (no Supabase) it returns a clear, non-breaking error
 * so the UI can show "configura Supabase para subir archivos".
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  pathPrefix = "",
): Promise<UploadResult> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Almacenamiento no disponible en modo demo. Configura Supabase Storage para habilitar la carga de archivos.",
    };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pathPrefix}${pathPrefix ? "/" : ""}${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}

/** Create a short-lived signed URL for a private object. */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}
