"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MEDELLIN_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from "./map-utils";
import { goldPin } from "./leaflet-icons";

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

/** Recenter the map to Medellín whenever `recenterToken` changes. */
function Recenter({ token }: { token: number }) {
  const map = useMap();
  useEffect(() => {
    if (token > 0) map.setView(MEDELLIN_CENTER, 13);
  }, [token, map]);
  return null;
}

export default function FineLocationPickerInner({
  lat,
  lng,
  onPick,
  recenterToken,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
  recenterToken: number;
}) {
  const hasPoint = lat !== null && lng !== null;
  const center: [number, number] = hasPoint ? [lat, lng] : MEDELLIN_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={hasPoint ? 15 : 12}
      scrollWheelZoom={false}
      style={{ height: 280, width: "100%" }}
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <ClickHandler onPick={onPick} />
      <Recenter token={recenterToken} />
      {hasPoint ? <Marker position={[lat, lng]} icon={goldPin()} /> : null}
    </MapContainer>
  );
}
