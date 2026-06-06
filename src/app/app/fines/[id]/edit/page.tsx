import { notFound } from "next/navigation";
import { getFine } from "@/lib/data/fines";
import { listMotorcycles } from "@/lib/data/motorcycles";
import { listCustomers } from "@/lib/data/customers";
import { listCameras } from "@/lib/data/cameras";
import { toMapCameras } from "@/components/maps/map-utils";
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

  const [motos, customers, cameras] = await Promise.all([
    listMotorcycles(),
    listCustomers(),
    listCameras(),
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
        cameras={toMapCameras(cameras)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
