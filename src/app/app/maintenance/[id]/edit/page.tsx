import { notFound } from "next/navigation";
import { getMaintenance } from "@/lib/data/maintenance";
import { listMotorcycles, getMotorcycle } from "@/lib/data/motorcycles";
import { updateMaintenanceAction } from "@/lib/actions/maintenance";
import { PageHeader } from "@/components/app/page-header";
import { MaintenanceForm } from "../../maintenance-form";

export const metadata = { title: "Editar mantenimiento" };

export default async function EditMaintenancePage({
  params,
}: {
  params: { id: string };
}) {
  const record = await getMaintenance(params.id);
  if (!record) notFound();

  const motos = await listMotorcycles();
  // Ensure the record's own motorcycle is always selectable, even if the list
  // doesn't include it (cache/pagination) — otherwise the prefill would clear
  // and saving would fail validation ("Selecciona una moto").
  if (!motos.some((m) => m.id === record.motorcycle_id)) {
    const own = await getMotorcycle(record.motorcycle_id);
    if (own) motos.unshift(own);
  }
  const action = updateMaintenanceAction.bind(null, record.id);

  return (
    <div>
      <PageHeader title="Editar mantenimiento" backHref="/app/maintenance" />
      <MaintenanceForm
        action={action}
        record={record}
        motorcycles={motos}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
