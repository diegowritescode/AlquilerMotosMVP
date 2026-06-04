"use client";

import { Bike, RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex items-center gap-2 text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-black">
          <Bike className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold uppercase tracking-wide">
          Moto Control
        </span>
      </div>

      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
        <WifiOff className="h-8 w-8" />
      </span>

      <h1 className="text-xl font-bold text-foreground">Sin conexión a internet</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Esta aplicación necesita conexión para consultar y guardar la información
        de la flota. Revisa tu conexión e intenta de nuevo.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-black transition-colors hover:bg-brand-400"
      >
        <RefreshCw className="h-4 w-4" /> Reintentar
      </button>
    </div>
  );
}
