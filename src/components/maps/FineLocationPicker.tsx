"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Crosshair, X, Camera } from "lucide-react";
import { Input, Label } from "@/components/ui/form";
import { osmLink } from "./map-utils";
import type { MapCamera } from "./types";

const Inner = dynamic(() => import("./FineLocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center bg-surface-2 text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

/**
 * Location picker for the fine form. Renders the lat/lng inputs that submit with
 * the form (names `lat` / `lng`) plus a mini map: click to set a manual point,
 * recenter on Medellín, clear. It also overlays Medellín's photo-detection
 * cameras — clicking a camera fixes the point to it and links it (`camera_id`),
 * and notifies the parent (via `onCameraPick`) so it can autocomplete fields.
 */
export function FineLocationPicker({
  defaultLat,
  defaultLng,
  cameras = [],
  defaultCameraId = null,
  onCameraPick,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
  cameras?: MapCamera[];
  defaultCameraId?: string | null;
  onCameraPick?: (cam: MapCamera) => void;
}) {
  const [lat, setLat] = useState<number | null>(defaultLat);
  const [lng, setLng] = useState<number | null>(defaultLng);
  const [cameraId, setCameraId] = useState<string | null>(defaultCameraId);
  const [recenterToken, setRecenterToken] = useState(0);

  // Manual point: clears any camera association.
  const pick = (la: number, ln: number) => {
    setLat(la);
    setLng(ln);
    setCameraId(null);
  };

  const pickCamera = (cam: MapCamera) => {
    setLat(cam.lat);
    setLng(cam.lng);
    setCameraId(cam.id);
    onCameraPick?.(cam);
  };

  const clear = () => {
    setLat(null);
    setLng(null);
    setCameraId(null);
  };

  const hasPoint = lat !== null && lng !== null;
  const selectedCamera = cameraId ? cameras.find((c) => c.id === cameraId) : null;

  return (
    <div data-testid="fine-location-picker" className="sm:col-span-2">
      <Label>Ubicación (opcional)</Label>
      <p className="mb-2 -mt-1 text-xs text-muted">
        Haz clic en el mapa para fijar el punto, o toca una cámara de fotomulta
        cercana para asociarla. También puedes escribir las coordenadas.
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <Inner
          lat={lat}
          lng={lng}
          onPick={pick}
          recenterToken={recenterToken}
          cameras={cameras}
          selectedCameraId={cameraId}
          onCameraPick={pickCamera}
        />
      </div>

      {/* Submitted with the form; empty string -> null in the schema. */}
      <input type="hidden" name="camera_id" value={cameraId ?? ""} />

      {selectedCamera ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-foreground">
          <span className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-brand" />
            Cámara asociada: <strong>{selectedCamera.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => setCameraId(null)}
            className="inline-flex items-center gap-1 text-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Quitar
          </button>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="lat">Latitud</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            placeholder="6.2476"
            value={lat ?? ""}
            onChange={(e) => {
              setLat(e.target.value === "" ? null : Number(e.target.value));
              setCameraId(null);
            }}
          />
        </div>
        <div>
          <Label htmlFor="lng">Longitud</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            placeholder="-75.5658"
            value={lng ?? ""}
            onChange={(e) => {
              setLng(e.target.value === "" ? null : Number(e.target.value));
              setCameraId(null);
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRecenterToken((t) => t + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-surface-2"
        >
          <Crosshair className="h-3.5 w-3.5" /> Centrar en Medellín
        </button>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" /> Limpiar ubicación
        </button>
        {hasPoint ? (
          <a
            href={osmLink(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-1.5 text-xs text-brand hover:bg-brand/10"
          >
            <MapPin className="h-3.5 w-3.5" /> Abrir en OpenStreetMap
          </a>
        ) : null}
      </div>
    </div>
  );
}
