import { AlertTriangle, MapPin, Plus } from "lucide-react";
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
import { FinesControls } from "./fines-controls";
import { FinesMap } from "@/components/maps/FinesMap";
import { MapEmptyState } from "@/components/maps/MapEmptyState";
import type { MapFine } from "@/components/maps/types";

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
  searchParams: {
    status?: string;
    view?: string;
    motorcycle?: string;
    customer?: string;
    from?: string;
    to?: string;
  };
}) {
  const status = (searchParams.status as FineStatus | "todos") ?? "todos";
  const [allFines, motos, customers] = await Promise.all([
    listFines({
      status,
      motorcycleId: searchParams.motorcycle,
      customerId: searchParams.customer,
    }),
    listMotorcycles(),
    listCustomers(),
  ]);

  // Date-range filter (applied to list and map alike).
  const fines = allFines.filter((f) => {
    if (searchParams.from && f.date < searchParams.from) return false;
    if (searchParams.to && f.date > searchParams.to) return false;
    return true;
  });

  const motoMap = new Map(motos.map((m) => [m.id, m]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const isMap = searchParams.view === "mapa";

  const mapFines: MapFine[] = fines
    .filter((f) => typeof f.lat === "number" && typeof f.lng === "number")
    .map((f) => {
      const moto = motoMap.get(f.motorcycle_id);
      const customer = f.customer_id ? customerMap.get(f.customer_id) : null;
      return {
        id: f.id,
        lat: f.lat as number,
        lng: f.lng as number,
        motoLabel: moto ? `${moto.brand} ${moto.model} · ${moto.plate}` : "Moto",
        customerLabel: customer?.full_name ?? null,
        reason: f.reason,
        amount: f.amount,
        status: f.status,
        statusLabel: FINE_STATUS_LABELS[f.status] ?? f.status,
        date: f.date,
      };
    });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fotomultas e infracciones"
        subtitle="Registro manual · ubicación opcional en mapa"
        action={
          <LinkButton href="/app/fines/new" size="sm">
            <Plus className="h-4 w-4" /> Registrar
          </LinkButton>
        }
      />

      <FilterTabs options={FILTERS} defaultValue="todos" />

      <FinesControls
        motos={motos.map((m) => ({ id: m.id, label: `${m.brand} ${m.model} · ${m.plate}` }))}
        customers={customers.map((c) => ({ id: c.id, label: c.full_name }))}
      />

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <MapPin className="h-3.5 w-3.5 text-brand" />
        {fines.length} multa{fines.length === 1 ? "" : "s"} · {mapFines.length} con
        ubicación
      </p>

      {/* Map view */}
      {isMap ? (
        mapFines.length > 0 ? (
          <FinesMap fines={mapFines} />
        ) : (
          <MapEmptyState />
        )
      ) : fines.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Aún no hay multas registradas"
          description="Consulta los comparendos en las fuentes oficiales (SIMIT/RUNT) y regístralos aquí. El sistema sugiere el arrendatario responsable según el alquiler activo en la fecha."
          actionLabel="Registrar multa"
          actionHref="/app/fines/new"
        />
      ) : (
        <div className="space-y-2">
          {fines.map((f) => {
            const moto = motoMap.get(f.motorcycle_id);
            const customer = f.customer_id ? customerMap.get(f.customer_id) : null;
            const hasLoc = typeof f.lat === "number" && typeof f.lng === "number";
            return (
              <AlertCard
                key={f.id}
                href={`/app/fines/${f.id}`}
                title={`${f.reason} · ${formatCOP(f.amount)}`}
                subtitle={`${moto ? `${moto.plate}` : ""}${customer ? ` · ${customer.full_name}` : ""} · ${formatDate(f.date)}${hasLoc ? " · 📍" : ""}`}
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
