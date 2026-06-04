import { notFound } from "next/navigation";
import { getPayment } from "@/lib/data/payments";
import { listCustomers } from "@/lib/data/customers";
import { listRentals } from "@/lib/data/rentals";
import { PageHeader } from "@/components/app/page-header";
import { PaymentForm } from "../../payment-form";
import { updatePaymentAction } from "@/lib/actions/payments";

export const metadata = { title: "Editar pago" };

export default async function EditPaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const payment = await getPayment(params.id);
  if (!payment) notFound();

  const [customers, rentals] = await Promise.all([
    listCustomers(),
    listRentals(),
  ]);

  const action = updatePaymentAction.bind(null, payment.id);

  return (
    <div>
      <PageHeader title="Editar pago" backHref={`/app/payments/${payment.id}`} />
      <PaymentForm
        action={action}
        payment={payment}
        customers={customers}
        rentals={rentals}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
