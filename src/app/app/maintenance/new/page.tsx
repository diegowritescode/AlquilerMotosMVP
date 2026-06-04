import { Bike } from "lucide-react";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { MaintenanceForm } from "../maintenance-form";
import { createMaintenanceAction } from "@/lib/actions/maintenance";

export const metadata = { title: "Nuevo mantenimiento" };

export default async function NewMaintenancePage({
  searchParams,
}: {
  searchParams: { motorcycle?: string };
}) {
  const motos = await listMotorcycles();

  if (motos.length === 0) {
    return (
      <div>
        <PageHeader title="Nuevo mantenimiento" backHref="/app/maintenance" />
        <EmptyState
          icon={Bike}
          title="Primero registra una moto"
          actionLabel="Agregar moto"
          actionHref="/app/motorcycles/new"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nuevo mantenimiento" backHref="/app/maintenance" />
      <MaintenanceForm
        action={createMaintenanceAction}
        motorcycles={motos}
        submitLabel="Registrar mantenimiento"
        defaultMotorcycleId={searchParams.motorcycle}
      />
    </div>
  );
}
