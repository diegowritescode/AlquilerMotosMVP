import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { MotorcycleForm } from "../../motorcycle-form";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { updateMotorcycleAction } from "@/lib/actions/motorcycles";

export const metadata = { title: "Editar moto" };

export default async function EditMotorcyclePage({
  params,
}: {
  params: { id: string };
}) {
  const moto = await getMotorcycle(params.id);
  if (!moto) notFound();

  const action = updateMotorcycleAction.bind(null, moto.id);

  return (
    <div>
      <PageHeader
        title={`Editar ${moto.brand} ${moto.model}`}
        backHref={`/app/motorcycles/${moto.id}`}
      />
      <MotorcycleForm
        action={action}
        motorcycle={moto}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
