"use client";

import dynamic from "next/dynamic";
import type { MapCamera } from "./types";

// Leaflet touches `window`, so load the map only on the client (no SSR).
const CamerasMapInner = dynamic(() => import("./CamerasMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] min-h-[360px] items-center justify-center bg-surface-2 text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export function CamerasMap({ cameras }: { cameras: MapCamera[] }) {
  return (
    <div
      data-testid="cameras-map"
      className="overflow-hidden rounded-2xl border border-border"
    >
      <CamerasMapInner cameras={cameras} />
    </div>
  );
}
