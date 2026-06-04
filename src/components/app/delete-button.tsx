"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Confirm-then-submit button for a destructive server action (logical delete).
 * Pass a bound server action via `action`.
 */
export function DeleteButton({
  action,
  label = "Eliminar",
  confirmText = "¿Seguro que deseas eliminar este registro? Quedará inactivo.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-danger/10"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" /> {label}
      </Button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <span className="text-xs text-muted">{confirmText}</span>
      <Button type="submit" variant="danger" size="sm">
        Sí, eliminar
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </Button>
    </form>
  );
}
