import L from "leaflet";

/**
 * Gold pin matching the app's brand accent (no external image assets, avoids
 * the bundler marker-icon 404). Import ONLY from inner map components that are
 * loaded via `dynamic(..., { ssr: false })`, never on the server.
 */
export function goldPin(): L.DivIcon {
  return L.divIcon({
    className: "moto-rental-pin",
    html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1.5c-4.4 0-8 3.5-8 7.9 0 5.6 7.2 13 7.5 13.3a.7.7 0 0 0 1 0C12.8 22.4 20 15 20 9.4c0-4.4-3.6-7.9-8-7.9Z" fill="#f5c518" stroke="#0a0a0b" stroke-width="1.5"/>
      <circle cx="12" cy="9.2" r="3" fill="#0a0a0b"/>
    </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  });
}

// Fill color per camera type (hex; mirrors CAMERA_TYPE_TONE conceptually).
const CAMERA_COLORS: Record<string, string> = {
  velocidad: "#2563eb", // info / blue
  semaforo_rojo: "#dc2626", // danger / red
  cebra: "#d97706", // warning / amber
  pico_y_placa: "#6b7280", // neutral / gray
  soat_tecnomecanica: "#6b7280",
  mixta: "#7c3aed", // violet (varias)
};

/**
 * Camera pin (fotodetección). A rounded marker with an inline camera glyph,
 * colored by type. Same "no external asset" approach as `goldPin()` — import
 * ONLY from inner map components loaded via `dynamic(..., { ssr: false })`.
 */
export function cameraPin(type?: string, opts?: { selected?: boolean }): L.DivIcon {
  const fill = (type && CAMERA_COLORS[type]) || "#2563eb";
  const ring = opts?.selected ? `<circle cx="14" cy="14" r="13" fill="none" stroke="#f5c518" stroke-width="2"/>` : "";
  return L.divIcon({
    className: "moto-rental-camera-pin",
    html: `<svg width="30" height="30" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      <circle cx="14" cy="14" r="11" fill="${fill}" stroke="#ffffff" stroke-width="2"/>
      <rect x="8" y="11" width="9" height="7" rx="1.4" fill="#ffffff"/>
      <path d="M17 13l3-1.6v5.2L17 15z" fill="#ffffff"/>
      <circle cx="12.2" cy="14.5" r="1.9" fill="${fill}"/>
    </svg>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}
