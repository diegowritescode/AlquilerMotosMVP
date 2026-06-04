import { FileText, ImageOff } from "lucide-react";
import { DeleteButton } from "@/components/app/delete-button";

export interface DocItem {
  id: string;
  label: string;
  signedUrl: string | null;
  isImage: boolean;
  deleteAction?: () => Promise<void>;
}

/** List of customer documents (private, signed URLs). */
export function DocumentList({
  items,
  emptyText,
}: {
  items: DocItem[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-2.5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-3 text-muted">
            {it.signedUrl && it.isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.signedUrl} alt={it.label} className="h-full w-full object-cover" />
            ) : it.signedUrl ? (
              <FileText className="h-6 w-6 text-brand" />
            ) : (
              <ImageOff className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{it.label}</p>
            {it.signedUrl ? (
              <a
                href={it.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand hover:underline"
              >
                Ver documento
              </a>
            ) : (
              <span className="text-xs text-muted">No disponible</span>
            )}
          </div>
          {it.deleteAction ? (
            <DeleteButton
              action={it.deleteAction}
              label="Eliminar"
              confirmText="¿Eliminar este documento?"
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
