"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Route-level error boundary. Catches client/render exceptions in any page and
 * shows a controlled message + retry (instead of the raw "Application error").
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Useful for diagnosing PWA/mobile-only crashes from the device console.
    console.error("[app error]", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="text-lg font-bold text-foreground">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Ocurrió un error al mostrar esta pantalla. Puedes reintentar; si persiste,
        revisa tu conexión o vuelve al inicio.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-black hover:bg-brand-400"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
        <a
          href="/app/dashboard"
          className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm text-foreground hover:bg-surface-2"
        >
          Ir al inicio
        </a>
      </div>
      {error?.digest ? (
        <p className="mt-4 text-[11px] text-muted">Ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
