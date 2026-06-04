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
