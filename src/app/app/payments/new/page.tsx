import { listCustomers } from "@/lib/data/customers";
import { listRentals } from "@/lib/data/rentals";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { PaymentForm } from "../payment-form";
import { createPaymentAction } from "@/lib/actions/payments";
import { Users } from "lucide-react";

export const metadata = { title: "Registrar pago" };

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: { customer?: string; rental?: string };
}) {
  const [customers, rentals] = await Promise.all([
    listCustomers(),
    listRentals(),
  ]);

  if (customers.length === 0) {
    return (
      <div>
        <PageHeader title="Registrar pago" backHref="/app/payments" />
        <EmptyState
          icon={Users}
          title="Primero registra un arrendatario"
          description="Necesitas un cliente para asociar el pago."
          actionLabel="Agregar cliente"
          actionHref="/app/customers/new"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Registrar pago" backHref="/app/payments" />
      <PaymentForm
        action={createPaymentAction}
        customers={customers}
        rentals={rentals}
        submitLabel="Registrar pago"
        defaultCustomerId={searchParams.customer}
        defaultRentalId={searchParams.rental}
      />
    </div>
  );
}
