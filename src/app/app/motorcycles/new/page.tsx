import { PageHeader } from "@/components/app/page-header";
import { MotorcycleForm } from "../motorcycle-form";
import { createMotorcycleAction } from "@/lib/actions/motorcycles";

export const metadata = { title: "Nueva moto" };

export default function NewMotorcyclePage() {
  return (
    <div>
      <PageHeader title="Nueva moto" backHref="/app/motorcycles" />
      <MotorcycleForm action={createMotorcycleAction} submitLabel="Crear moto" />
    </div>
  );
}
