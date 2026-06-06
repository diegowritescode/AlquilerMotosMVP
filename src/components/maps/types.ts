/** Minimal fine shape needed to render a pin + popup on the map. */
export interface MapFine {
  id: string;
  lat: number;
  lng: number;
  motoLabel: string;
  customerLabel?: string | null;
  reason: string;
  amount: number;
  status: string;
  statusLabel: string;
  date: string;
}

/** Photo-detection camera shape for map markers + the form picker layer. */
export interface MapCamera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: string;
  typeLabel: string;
  zone?: string | null;
  maxSpeedKmh?: number | null;
  approximate: boolean;
}
