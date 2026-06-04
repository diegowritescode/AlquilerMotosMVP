import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { CustomerForm } from "../../customer-form";
import { getCustomer } from "@/lib/data/customers";
import { updateCustomerAction } from "@/lib/actions/customers";

export const metadata = { title: "Editar arrendatario" };

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  const action = updateCustomerAction.bind(null, customer.id);

  return (
    <div>
      <PageHeader
        title={`Editar ${customer.full_name}`}
        backHref={`/app/customers/${customer.id}`}
      />
      <CustomerForm action={action} customer={customer} submitLabel="Guardar cambios" />
    </div>
  );
}
