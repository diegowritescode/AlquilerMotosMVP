import { createSupabaseAdminClient } from "./supabase/admin";
import { STORAGE_BUCKETS, type StorageBucket } from "./storage";

/**
 * SERVER-ONLY Storage helpers (use service-role client).
 *
 * Buckets (créalos PRIVADOS en Supabase — ver docs/database.md):
 *   motorcycle-photos · customer-documents · payment-evidence · fine-evidence
 *
 * En Fase 1 los formularios guardan rutas/URLs en columnas *_url (photo_url,
 * evidence_url, file_url). Estos helpers permiten:
 *   - subir un archivo desde una Server Action (uploadServer)
 *   - generar URLs firmadas para mostrar archivos privados (signedUrlServer)
 */
export { STORAGE_BUCKETS };
export type { StorageBucket };

export interface ServerUploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

/** Sube un archivo a un bucket usando la service-role key (server). */
export async function uploadServer(
  bucket: StorageBucket,
  file: File,
  pathPrefix = "",
): Promise<ServerUploadResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Storage no disponible: configura Supabase (URL + SERVICE_ROLE_KEY) y crea los buckets.",
    };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pathPrefix}${pathPrefix ? "/" : ""}${Date.now()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}

/** Crea una URL firmada (privada, temporal) para un objeto del bucket. */
export async function signedUrlServer(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}
