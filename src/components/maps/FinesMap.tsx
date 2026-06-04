"use client";

import dynamic from "next/dynamic";
import type { MapFine } from "./types";

// Leaflet touches `window`, so load the map only on the client (no SSR).
const FinesMapInner = dynamic(() => import("./FinesMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] min-h-[360px] items-center justify-center bg-surface-2 text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export function FinesMap({ fines }: { fines: MapFine[] }) {
  return (
    <div
      data-testid="fines-map"
      className="overflow-hidden rounded-2xl border border-border"
    >
      <FinesMapInner fines={fines} />
    </div>
  );
}
