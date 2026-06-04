/**
 * Pure map constants/helpers — NO leaflet import here, so this module is safe to
 * import from server components and from client wrappers rendered during SSR.
 * The Leaflet-only icon lives in `leaflet-icons.ts` (loaded by the inner maps).
 */

/** Default map center: Medellín, Colombia. */
export const MEDELLIN_CENTER: [number, number] = [6.2476, -75.5658];
export const MEDELLIN_ZOOM = 12;

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** OpenStreetMap deep link for a coordinate. */
export function osmLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}
