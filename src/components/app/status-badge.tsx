import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/lib/utils";

/**
 * Maps a status value to a label + tone using a provided dictionary.
 * Used across motorcycles, rentals, payments, maintenance and fines.
 */
export function StatusBadge({
  value,
  labels,
  tones,
}: {
  value: string;
  labels: Record<string, string>;
  tones: Record<string, Tone>;
}) {
  return <Badge tone={tones[value] ?? "neutral"}>{labels[value] ?? value}</Badge>;
}
