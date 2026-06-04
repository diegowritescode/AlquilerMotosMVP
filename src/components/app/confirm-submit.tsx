"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Confirm-then-submit for a destructive Server Action form (e.g. cancelar
 * alquiler). Renders the given hidden inputs and requires a second click.
 */
export function ConfirmSubmit({
  action,
  hidden,
  label,
  confirmText,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  label: string;
  confirmText: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={action} className="flex items-center gap-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {!confirming ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-danger hover:bg-danger/10"
          onClick={() => setConfirming(true)}
        >
          {label}
        </Button>
      ) : (
        <>
          <span className="text-xs text-muted">{confirmText}</span>
          <Button type="submit" variant="danger" size="sm">
            Sí, cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            No
          </Button>
        </>
      )}
    </form>
  );
}
