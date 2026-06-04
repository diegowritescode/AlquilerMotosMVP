/**
 * Shared file-upload constraints + validation. Used both client-side (to give
 * instant feedback in FileUploadField) and server-side (the source of truth in
 * the upload Server Actions). Keep this framework-free so it is unit-testable.
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

/** `accept` attribute for <input type="file">. */
export const FILE_ACCEPT = ALLOWED_MIME_TYPES.join(",");

export interface FileLike {
  type: string;
  size: number;
  name?: string;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/** Validate a file against the allowed types and the max size. */
export function validateUploadFile(file: FileLike | null | undefined): ValidationResult {
  if (!file || !file.size) {
    return { ok: false, error: "Selecciona un archivo." };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMime)) {
    return {
      ok: false,
      error: "Tipo no permitido. Usa JPG, PNG, WEBP o PDF.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: `El archivo supera el máximo de ${formatBytes(MAX_FILE_SIZE)}.`,
    };
  }
  return { ok: true };
}

/** Human-readable byte size, e.g. "2.3 MB". */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Whether a stored file (by mime or extension) is an image we can preview. */
export function isImageType(typeOrPath: string): boolean {
  const v = typeOrPath.toLowerCase();
  return (
    v.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif)$/.test(v)
  );
}
