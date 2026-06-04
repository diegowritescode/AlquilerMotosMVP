"use client";

import { useFormState } from "react-dom";
import { Download, FileText } from "lucide-react";
import type { UploadState } from "@/lib/actions/uploads";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: UploadState, formData: FormData) => Promise<UploadState>;

/** Acta del alquiler: estado + generar/ver/descargar/regenerar. */
export function RentalContractSection({
  action,
  signedUrl,
  downloadHref,
  version,
  generatedAtLabel,
}: {
  action: Action;
  signedUrl: string | null;
  downloadHref: string;
  version?: number;
  generatedAtLabel?: string;
}) {
  const [state, formAction] = useFormState(action, {} as UploadState);
  const hasContract = Boolean(signedUrl);

  return (
    <div data-testid="rental-contract" className="space-y-3">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? (
        <FormMessage type="success">Acta generada correctamente.</FormMessage>
      ) : null}

      {hasContract ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground">
            Acta generada{version ? ` (v${version})` : ""}
            {generatedAtLabel ? ` · ${generatedAtLabel}` : ""}.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={signedUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="rental-contract-link"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground hover:border-brand/40"
            >
              <FileText className="h-4 w-4 text-brand" /> Ver acta
            </a>
            <a
              href={downloadHref}
              data-testid="rental-contract-download"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground hover:border-brand/40"
            >
              <Download className="h-4 w-4 text-brand" /> Descargar
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Sin acta generada.</p>
      )}

      <form action={formAction}>
        <SubmitButton
          size="sm"
          variant={hasContract ? "secondary" : "primary"}
          pendingLabel="Generando..."
        >
          {hasContract ? "Regenerar acta" : "Generar acta PDF"}
        </SubmitButton>
      </form>
    </div>
  );
}
