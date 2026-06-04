import { notFound } from "next/navigation";
import { getRental } from "@/lib/data/rentals";
import { listCustomers } from "@/lib/data/customers";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { PageHeader } from "@/components/app/page-header";
import { RentalForm } from "../../rental-form";
import { updateRentalAction } from "@/lib/actions/rentals";

export const metadata = { title: "Editar alquiler" };

export default async function EditRentalPage({
  params,
}: {
  params: { id: string };
}) {
  const rental = await getRental(params.id);
  if (!rental) notFound();

  const [customers, allMotos] = await Promise.all([
    listCustomers(),
    listMotorcycles(),
  ]);
  const selectable = allMotos.filter(
    (m) => m.current_status === "disponible" || m.id === rental.motorcycle_id,
  );

  const action = updateRentalAction.bind(null, rental.id);

  return (
    <div>
      <PageHeader title="Editar alquiler" backHref={`/app/rentals/${rental.id}`} />
      <RentalForm
        action={action}
        rental={rental}
        customers={customers}
        motorcycles={selectable}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
