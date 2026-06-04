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
