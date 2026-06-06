import { Camera, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { listCameras } from "@/lib/data/cameras";
import { deleteCameraAction } from "@/lib/actions/cameras";
import { CAMERA_TYPE_LABELS } from "@/lib/constants";
import { toMapCameras } from "@/components/maps/map-utils";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/app/delete-button";
import { CamerasMap } from "@/components/maps/CamerasMap";

export const metadata = { title: "Cámaras de fotomulta" };

export default async function CamerasPage() {
  const cameras = await listCameras();
  const mapCameras = toMapCameras(cameras);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cámaras de fotomulta · Medellín"
        subtitle="Puntos oficiales (aprox.) · editables"
        backHref="/app/fines?view=camaras"
        action={
          <LinkButton href="/app/fines/cameras/new" size="sm">
            <Plus className="h-4 w-4" /> Agregar cámara
          </LinkButton>
        }
      />

      {cameras.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No hay cámaras registradas"
          description="Agrega los puntos de fotodetección para verlos en el mapa y asociarlos a las fotomultas."
          actionLabel="Agregar cámara"
          actionHref="/app/fines/cameras/new"
        />
      ) : (
        <>
          {mapCameras.length > 0 ? <CamerasMap cameras={mapCameras} /> : null}

          <p className="text-xs text-muted">
            {cameras.length} cámara{cameras.length === 1 ? "" : "s"} · las
            ubicaciones son aproximadas; puedes ajustarlas al editar.
          </p>

          <div className="space-y-2">
            {cameras.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted">
                    {CAMERA_TYPE_LABELS[c.type] ?? c.type}
                    {c.max_speed_kmh ? ` · Máx ${c.max_speed_kmh} km/h` : ""}
                    {c.zone ? ` · ${c.zone}` : ""}
                    {c.approximate ? " · aprox." : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/app/fines/cameras/${c.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Link>
                  <DeleteButton action={deleteCameraAction.bind(null, c.id)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
