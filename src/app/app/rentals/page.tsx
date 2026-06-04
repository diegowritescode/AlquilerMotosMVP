import { FileText, Plus } from "lucide-react";
import { listRentals } from "@/lib/data/rentals";
import { listCustomers } from "@/lib/data/customers";
import { listMotorcycles } from "@/lib/data/motorcycles";
import type { RentalStatus } from "@/lib/types";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TONE } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { FilterTabs } from "@/components/app/filter-tabs";
import { EntityCard } from "@/components/app/entity-card";
import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Alquileres" };

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "pendiente_aprobacion", label: "Pendientes" },
  { value: "finalizado", label: "Finalizados" },
  { value: "vencido", label: "Vencidos" },
  { value: "cancelado", label: "Cancelados" },
];

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (searchParams.status as RentalStatus | "todos") ?? "todos";
  const [rentals, customers, motos] = await Promise.all([
    listRentals({ status }),
    listCustomers(),
    listMotorcycles(),
  ]);

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const motoMap = new Map(motos.map((m) => [m.id, m]));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alquileres"
        subtitle={`${rentals.length} ${rentals.length === 1 ? "alquiler" : "alquileres"}`}
        action={
          <LinkButton href="/app/rentals/new" size="sm">
            <Plus className="h-4 w-4" /> Nuevo
          </LinkButton>
        }
      />

      <FilterTabs options={FILTERS} defaultValue="todos" />

      {rentals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aún no hay alquileres"
          description="Crea un alquiler asignando una moto disponible a un arrendatario. Al activarlo, la moto pasa automáticamente a “alquilada”."
          actionLabel="Crear alquiler"
          actionHref="/app/rentals/new"
        />
      ) : (
        <div className="space-y-2">
          {rentals.map((r) => {
            const customer = customerMap.get(r.customer_id);
            const moto = motoMap.get(r.motorcycle_id);
            return (
              <EntityCard
                key={r.id}
                href={`/app/rentals/${r.id}`}
                title={customer?.full_name ?? "Cliente"}
                lines={[
                  moto ? `${moto.brand} ${moto.model} · ${moto.plate}` : "Moto",
                  `${formatDate(r.start_date)} · ${formatCOP(r.agreed_value)}`,
                ]}
                right={
                  <StatusBadge
                    value={r.status}
                    labels={RENTAL_STATUS_LABELS}
                    tones={RENTAL_STATUS_TONE}
                  />
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
