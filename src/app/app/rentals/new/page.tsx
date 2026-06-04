import { listCustomers } from "@/lib/data/customers";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { RentalForm } from "../rental-form";
import { createRentalAction } from "@/lib/actions/rentals";
import { Bike } from "lucide-react";

export const metadata = { title: "Nuevo alquiler" };

export default async function NewRentalPage({
  searchParams,
}: {
  searchParams: { customer?: string; motorcycle?: string };
}) {
  const [customers, allMotos] = await Promise.all([
    listCustomers(),
    listMotorcycles(),
  ]);

  // Offer motos that are available (or already preselected via query).
  const selectable = allMotos.filter(
    (m) => m.current_status === "disponible" || m.id === searchParams.motorcycle,
  );

  if (customers.length === 0) {
    return (
      <div>
        <PageHeader title="Nuevo alquiler" backHref="/app/rentals" />
        <EmptyState
          icon={Bike}
          title="Primero registra un arrendatario"
          description="Necesitas al menos un cliente para crear un alquiler."
          actionLabel="Agregar cliente"
          actionHref="/app/customers/new"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nuevo alquiler" backHref="/app/rentals" />
      <RentalForm
        action={createRentalAction}
        customers={customers}
        motorcycles={selectable}
        submitLabel="Crear alquiler"
        defaultCustomerId={searchParams.customer}
        defaultMotorcycleId={searchParams.motorcycle}
      />
    </div>
  );
}
