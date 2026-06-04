import { notFound } from "next/navigation";
import { getPayment } from "@/lib/data/payments";
import { listCustomers } from "@/lib/data/customers";
import { activeRentalsByCustomer, getRental } from "@/lib/data/rentals";
import { getMotorcycle } from "@/lib/data/motorcycles";
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

  const [customers, activeRentals] = await Promise.all([
    listCustomers(),
    activeRentalsByCustomer(),
  ]);

  // Resolve the label of the payment's existing rental (may be finalized).
  let currentRental: { id: string; label: string } | null = null;
  if (payment.rental_id) {
    const r = await getRental(payment.rental_id);
    if (r) {
      const m = await getMotorcycle(r.motorcycle_id);
      currentRental = {
        id: r.id,
        label: m ? `${m.brand} ${m.model} · ${m.plate}` : "Alquiler",
      };
    }
  }

  const action = updatePaymentAction.bind(null, payment.id);

  return (
    <div>
      <PageHeader title="Editar pago" backHref={`/app/payments/${payment.id}`} />
      <PaymentForm
        action={action}
        payment={payment}
        customers={customers}
        activeRentals={activeRentals}
        currentRental={currentRental}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
