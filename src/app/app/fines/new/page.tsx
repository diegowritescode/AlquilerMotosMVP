import { Bike } from "lucide-react";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { listCustomers } from "@/lib/data/customers";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { FineForm } from "../fine-form";
import { createFineAction } from "@/lib/actions/fines";

export const metadata = { title: "Registrar multa" };

export default async function NewFinePage({
  searchParams,
}: {
  searchParams: { motorcycle?: string };
}) {
  const [motos, customers] = await Promise.all([
    listMotorcycles(),
    listCustomers(),
  ]);

  if (motos.length === 0) {
    return (
      <div>
        <PageHeader title="Registrar multa" backHref="/app/fines" />
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
      <PageHeader title="Registrar multa" backHref="/app/fines" />
      <FineForm
        action={createFineAction}
        motorcycles={motos}
        customers={customers}
        submitLabel="Registrar multa"
        defaultMotorcycleId={searchParams.motorcycle}
      />
    </div>
  );
}
