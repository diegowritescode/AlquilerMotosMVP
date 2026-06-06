"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  MEDELLIN_CENTER,
  MEDELLIN_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  osmLink,
} from "./map-utils";
import { cameraPin } from "./leaflet-icons";
import type { MapCamera } from "./types";

export default function CamerasMapInner({ cameras }: { cameras: MapCamera[] }) {
  return (
    <MapContainer
      center={MEDELLIN_CENTER}
      zoom={MEDELLIN_ZOOM}
      scrollWheelZoom={false}
      style={{ height: "70vh", minHeight: 360, width: "100%" }}
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      {cameras.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={cameraPin(c.type)}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs">
                Tipo: {c.typeLabel}
                {c.maxSpeedKmh ? ` · Máx ${c.maxSpeedKmh} km/h` : ""}
              </p>
              {c.zone ? <p className="text-xs">Corredor: {c.zone}</p> : null}
              {c.approximate ? (
                <p className="text-xs italic text-amber-600">
                  Ubicación aproximada
                </p>
              ) : null}
              <p className="pt-1 text-xs">
                <a
                  href={osmLink(c.lat, c.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Ver en OpenStreetMap
                </a>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
