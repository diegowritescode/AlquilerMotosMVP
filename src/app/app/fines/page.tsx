import { AlertTriangle, Plus } from "lucide-react";
import { listFines } from "@/lib/data/fines";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { listCustomers } from "@/lib/data/customers";
import type { FineStatus } from "@/lib/types";
import { FINE_STATUS_LABELS, FINE_STATUS_TONE } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { FilterTabs } from "@/components/app/filter-tabs";
import { AlertCard } from "@/components/app/alert-card";
import { EmptyState } from "@/components/app/empty-state";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Fotomultas" };

const FILTERS = [
  { value: "todos", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "en_disputa", label: "En disputa" },
  { value: "pagada", label: "Pagadas" },
  { value: "asumida_cliente", label: "Asumidas cliente" },
  { value: "asumida_dueno", label: "Asumidas dueño" },
];

export default async function FinesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (searchParams.status as FineStatus | "todos") ?? "todos";
  const [fines, motos, customers] = await Promise.all([
    listFines({ status }),
    listMotorcycles(),
    listCustomers(),
  ]);
  const motoMap = new Map(motos.map((m) => [m.id, m]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fotomultas e infracciones"
        subtitle="Registro manual"
        action={
          <LinkButton href="/app/fines/new" size="sm">
            <Plus className="h-4 w-4" /> Registrar
          </LinkButton>
        }
      />

      <FilterTabs options={FILTERS} defaultValue="todos" />

      {fines.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sin multas registradas"
          description="Registra manualmente las fotomultas o comparendos consultados en las fuentes oficiales."
          actionLabel="Registrar multa"
          actionHref="/app/fines/new"
        />
      ) : (
        <div className="space-y-2">
          {fines.map((f) => {
            const moto = motoMap.get(f.motorcycle_id);
            const customer = f.customer_id ? customerMap.get(f.customer_id) : null;
            return (
              <AlertCard
                key={f.id}
                href={`/app/fines/${f.id}`}
                title={`${f.reason} · ${formatCOP(f.amount)}`}
                subtitle={`${moto ? `${moto.plate}` : ""}${customer ? ` · ${customer.full_name}` : ""} · ${formatDate(f.date)}`}
                badgeLabel={FINE_STATUS_LABELS[f.status]}
                tone={FINE_STATUS_TONE[f.status]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
