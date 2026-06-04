"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { FILE_ACCEPT, formatBytes, validateUploadFile } from "@/lib/upload";
import type { UploadState } from "@/lib/actions/uploads";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: UploadState, formData: FormData) => Promise<UploadState>;

/**
 * Reusable upload field. Posts a single file (input name="file") to a bound
 * Server Action that uploads it server-side (service-role, never in client).
 * Client-side validation gives instant feedback; the server re-validates.
 */
export function FileUploadField({
  action,
  buttonLabel = "Subir archivo",
  hint,
  testId,
  children,
}: {
  action: Action;
  buttonLabel?: string;
  hint?: string;
  testId?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, {} as UploadState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setFileInfo(null);
      setLocalError(null);
    }
  }, [state]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setFileInfo(null);
      setLocalError(null);
      return;
    }
    const r = validateUploadFile(f);
    setLocalError(r.ok ? null : (r.error ?? "Archivo inválido."));
    setFileInfo({ name: f.name, size: f.size });
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      data-testid={testId}
      className="space-y-2 rounded-xl border border-border bg-surface-2 p-3"
    >
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {localError ? <FormMessage>{localError}</FormMessage> : null}
      {state.success ? (
        <FormMessage type="success">Archivo subido correctamente.</FormMessage>
      ) : null}

      {children}

      <input
        type="file"
        name="file"
        accept={FILE_ACCEPT}
        onChange={onChange}
        className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface-3/80"
      />
      {fileInfo ? (
        <p className="text-xs text-muted">
          {fileInfo.name} · {formatBytes(fileInfo.size)}
        </p>
      ) : null}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}

      <SubmitButton
        size="sm"
        disabled={!!localError || !fileInfo}
        pendingLabel="Subiendo..."
      >
        {buttonLabel}
      </SubmitButton>
    </form>
  );
}
