import { ImageOff } from "lucide-react";
import { DeleteButton } from "@/components/app/delete-button";

export interface GalleryItem {
  id: string;
  signedUrl: string | null;
  deleteAction?: () => Promise<void>;
}

/** Responsive thumbnail grid for motorcycle photos (private, signed URLs). */
export function ImagePreviewGrid({
  items,
  emptyText,
}: {
  items: GalleryItem[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="group relative overflow-hidden rounded-xl border border-border bg-surface-2"
        >
          {it.signedUrl ? (
            <a href={it.signedUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.signedUrl}
                alt="Foto de la moto"
                className="aspect-square w-full object-cover"
              />
            </a>
          ) : (
            <div className="flex aspect-square items-center justify-center text-muted">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
          {it.deleteAction ? (
            <div className="absolute right-1 top-1 rounded-lg bg-background/80 backdrop-blur">
              <DeleteButton
                action={it.deleteAction}
                label="Quitar"
                confirmText="¿Eliminar esta foto?"
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
