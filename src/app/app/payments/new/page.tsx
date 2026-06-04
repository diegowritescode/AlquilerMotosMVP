import { listCustomers } from "@/lib/data/customers";
import { activeRentalsByCustomer } from "@/lib/data/rentals";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { PaymentForm } from "../payment-form";
import { createPaymentAction } from "@/lib/actions/payments";
import { Users } from "lucide-react";

export const metadata = { title: "Registrar pago" };

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: { customer?: string };
}) {
  const [customers, activeRentals] = await Promise.all([
    listCustomers(),
    activeRentalsByCustomer(),
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
        activeRentals={activeRentals}
        submitLabel="Registrar pago"
        defaultCustomerId={searchParams.customer}
      />
    </div>
  );
}
