import { FileText } from "lucide-react";

/** Shows a single evidence file (image preview or PDF/file link), or empty text. */
export function EvidenceViewer({
  signedUrl,
  isImage,
  emptyText,
}: {
  signedUrl: string | null;
  isImage: boolean;
  emptyText: string;
}) {
  if (!signedUrl) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  if (isImage) {
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-xl border border-border"
        data-testid="evidence-file"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrl}
          alt="Evidencia"
          className="max-h-72 w-full object-contain bg-surface-2"
        />
      </a>
    );
  }
  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="evidence-file"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground hover:border-brand/40"
    >
      <FileText className="h-4 w-4 text-brand" /> Ver comprobante (archivo)
    </a>
  );
}
