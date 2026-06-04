import { Plus, Wrench } from "lucide-react";
import { listMaintenance } from "@/lib/data/maintenance";
import { listMotorcycles } from "@/lib/data/motorcycles";
import type { MaintenanceStatus } from "@/lib/types";
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_TONE,
  MAINTENANCE_TYPE_LABELS,
} from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { FilterTabs } from "@/components/app/filter-tabs";
import { AlertCard } from "@/components/app/alert-card";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Mantenimientos" };

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "programado", label: "Programados" },
  { value: "vencido", label: "Vencidos" },
  { value: "realizado", label: "Realizados" },
];

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (searchParams.status as MaintenanceStatus | "todos") ?? "todos";
  const [records, motos] = await Promise.all([
    listMaintenance({ status }),
    listMotorcycles(),
  ]);
  const motoMap = new Map(motos.map((m) => [m.id, m]));

  const all = await listMaintenance();
  const pending = all.filter((m) => m.status !== "realizado").length;
  const totalCost = all
    .filter((m) => m.status === "realizado" && m.cost)
    .reduce((s, m) => s + (m.cost ?? 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mantenimientos"
        action={
          <LinkButton href="/app/maintenance/new" size="sm">
            <Plus className="h-4 w-4" /> Agregar
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pendientes" value={pending} icon={Wrench} tone={pending > 0 ? "warning" : "success"} />
        <StatCard label="Costo realizado" value={formatCOP(totalCost)} tone="neutral" />
      </div>

      <FilterTabs options={FILTERS} defaultValue="todos" />

      {records.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Aún no hay mantenimientos"
          description="Programa o registra mantenimientos (aceite, frenos, llantas) y recibe alertas antes del próximo para evitar paradas."
          actionLabel="Agregar mantenimiento"
          actionHref="/app/maintenance/new"
        />
      ) : (
        <div className="space-y-2">
          {records.map((m) => {
            const moto = motoMap.get(m.motorcycle_id);
            return (
              <AlertCard
                key={m.id}
                href={moto ? `/app/motorcycles/${moto.id}` : undefined}
                title={`${MAINTENANCE_TYPE_LABELS[m.type]} · ${moto ? `${moto.brand} ${moto.model}` : "Moto"}`}
                subtitle={`${formatDate(m.date)}${m.cost ? ` · ${formatCOP(m.cost)}` : ""}${m.next_date ? ` · próx. ${formatDate(m.next_date)}` : ""}`}
                badgeLabel={MAINTENANCE_STATUS_LABELS[m.status]}
                tone={MAINTENANCE_STATUS_TONE[m.status]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
