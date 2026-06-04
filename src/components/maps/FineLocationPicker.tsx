"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Crosshair, X } from "lucide-react";
import { Input, Label } from "@/components/ui/form";
import { osmLink } from "./map-utils";

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
 * the form (names `lat` / `lng`) plus a mini map: click to set, recenter on
 * Medellín, clear. No geocoding and no GPS prompts.
 */
export function FineLocationPicker({
  defaultLat,
  defaultLng,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const [lat, setLat] = useState<number | null>(defaultLat);
  const [lng, setLng] = useState<number | null>(defaultLng);
  const [recenterToken, setRecenterToken] = useState(0);

  const pick = (la: number, ln: number) => {
    setLat(la);
    setLng(ln);
  };

  const clear = () => {
    setLat(null);
    setLng(null);
  };

  const hasPoint = lat !== null && lng !== null;

  return (
    <div data-testid="fine-location-picker" className="sm:col-span-2">
      <Label>Ubicación (opcional)</Label>
      <p className="mb-2 -mt-1 text-xs text-muted">
        Haz clic en el mapa para fijar el punto, o escribe las coordenadas. La
        ubicación es manual; el mapa solo se usa para visualizar.
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <Inner lat={lat} lng={lng} onPick={pick} recenterToken={recenterToken} />
      </div>

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
            onChange={(e) =>
              setLat(e.target.value === "" ? null : Number(e.target.value))
            }
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
            onChange={(e) =>
              setLng(e.target.value === "" ? null : Number(e.target.value))
            }
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
