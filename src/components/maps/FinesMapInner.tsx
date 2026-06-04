"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatCOP, formatDate } from "@/lib/utils";
import {
  MEDELLIN_CENTER,
  MEDELLIN_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  osmLink,
} from "./map-utils";
import { goldPin } from "./leaflet-icons";
import type { MapFine } from "./types";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1 && points[0]) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

export default function FinesMapInner({ fines }: { fines: MapFine[] }) {
  const points = fines.map((f) => [f.lat, f.lng] as [number, number]);
  const icon = goldPin();

  return (
    <MapContainer
      center={MEDELLIN_CENTER}
      zoom={MEDELLIN_ZOOM}
      scrollWheelZoom={false}
      style={{ height: "70vh", minHeight: 360, width: "100%" }}
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <FitBounds points={points} />
      {fines.map((f) => (
        <Marker key={f.id} position={[f.lat, f.lng]} icon={icon}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{f.motoLabel}</p>
              {f.customerLabel ? (
                <p className="text-xs">Responsable: {f.customerLabel}</p>
              ) : null}
              <p className="text-xs">{f.reason}</p>
              <p className="text-xs">
                {formatCOP(f.amount)} · {f.statusLabel} · {formatDate(f.date)}
              </p>
              <p className="flex gap-3 pt-1 text-xs">
                <a href={`/app/fines/${f.id}`} className="font-medium underline">
                  Ver detalle
                </a>
                <a
                  href={osmLink(f.lat, f.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenStreetMap
                </a>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
