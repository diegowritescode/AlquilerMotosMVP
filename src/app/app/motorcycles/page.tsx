import { Bike, Plus } from "lucide-react";
import { listMotorcycles } from "@/lib/data/motorcycles";
import type { MotorcycleStatus } from "@/lib/types";
import { formatCOP } from "@/lib/utils";
import {
  MOTORCYCLE_STATUS_LABELS,
  MOTORCYCLE_STATUS_TONE,
} from "@/lib/constants";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/search-input";
import { FilterTabs } from "@/components/app/filter-tabs";
import { EntityCard, IconThumb } from "@/components/app/entity-card";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Motos" };

const FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "disponible", label: "Disponibles" },
  { value: "alquilada", label: "Alquiladas" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "inactiva", label: "Inactivas" },
];

export default async function MotorcyclesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const status = (searchParams.status as MotorcycleStatus | "todas") ?? "todas";
  const motos = await listMotorcycles({ search: searchParams.q, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mis Motos"
        subtitle={`${motos.length} ${motos.length === 1 ? "moto" : "motos"}`}
        action={
          <LinkButton href="/app/motorcycles/new" size="sm">
            <Plus className="h-4 w-4" /> Agregar
          </LinkButton>
        }
      />

      <SearchInput placeholder="Buscar por placa, marca o modelo" />
      <FilterTabs options={FILTERS} defaultValue="todas" />

      {motos.length === 0 ? (
        <EmptyState
          icon={Bike}
          title="Sin motos"
          description="No hay motos que coincidan. Agrega tu primera moto para empezar."
          actionLabel="Agregar moto"
          actionHref="/app/motorcycles/new"
        />
      ) : (
        <div className="space-y-2">
          {motos.map((m) => (
            <EntityCard
              key={m.id}
              href={`/app/motorcycles/${m.id}`}
              thumbnail={
                <IconThumb>
                  <Bike className="h-6 w-6" />
                </IconThumb>
              }
              title={`${m.brand} ${m.model}`}
              lines={[
                `Placa ${m.plate} · ${m.cc}cc · ${m.year}`,
                `${formatCOP(m.weekly_price)} / semana`,
              ]}
              right={
                <StatusBadge
                  value={m.current_status}
                  labels={MOTORCYCLE_STATUS_LABELS}
                  tones={MOTORCYCLE_STATUS_TONE}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
