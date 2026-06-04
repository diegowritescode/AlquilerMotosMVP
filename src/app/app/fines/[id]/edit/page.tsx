import { notFound } from "next/navigation";
import { getFine } from "@/lib/data/fines";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { listCustomers } from "@/lib/data/customers";
import { PageHeader } from "@/components/app/page-header";
import { FineForm } from "../../fine-form";
import { updateFineAction } from "@/lib/actions/fines";

export const metadata = { title: "Editar multa" };

export default async function EditFinePage({
  params,
}: {
  params: { id: string };
}) {
  const fine = await getFine(params.id);
  if (!fine) notFound();

  const [motos, customers] = await Promise.all([
    listMotorcycles(),
    listCustomers(),
  ]);

  const action = updateFineAction.bind(null, fine.id);

  return (
    <div>
      <PageHeader title="Editar multa" backHref={`/app/fines/${fine.id}`} />
      <FineForm
        action={action}
        fine={fine}
        motorcycles={motos}
        customers={customers}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
