import { PageHeader } from "@/components/app/page-header";
import { CustomerForm } from "../customer-form";
import { createCustomerAction } from "@/lib/actions/customers";

export const metadata = { title: "Nuevo arrendatario" };

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="Nuevo arrendatario" backHref="/app/customers" />
      <CustomerForm action={createCustomerAction} submitLabel="Crear cliente" />
    </div>
  );
}
