import { MapPin } from "lucide-react";

export function MapEmptyState() {
  return (
    <div
      data-testid="fines-map-empty"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center"
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <MapPin className="h-6 w-6" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">
        Aún no hay fotomultas con ubicación
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Agrega coordenadas o selecciona una ubicación en el mapa al registrar o
        editar una multa para verlas aquí.
      </p>
    </div>
  );
}
