import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Receipt } from "lucide-react";
import { getRental } from "@/lib/data/rentals";
import { getCustomer } from "@/lib/data/customers";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { listPayments } from "@/lib/data/payments";
import {
  finalizeRentalAction,
  changeRentalStatusAction,
} from "@/lib/actions/rentals";
import {
  PAYMENT_FREQUENCY_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  RENTAL_STATUS_LABELS,
  RENTAL_STATUS_TONE,
} from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { AlertCard } from "@/components/app/alert-card";
import { StatusBadge } from "@/components/app/status-badge";
import { LinkButton, Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/app/whatsapp-button";
import { Select } from "@/components/ui/form";

export default async function RentalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rental = await getRental(params.id);
  if (!rental) notFound();

  const [customer, moto, payments] = await Promise.all([
    getCustomer(rental.customer_id),
    getMotorcycle(rental.motorcycle_id),
    listPayments({ rentalId: rental.id }),
  ]);

  const paidTotal = payments
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + p.amount, 0);
  const isActive = rental.status === "activo";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detalle del alquiler"
        subtitle={customer?.full_name}
        backHref="/app/rentals"
        action={
          <LinkButton href={`/app/rentals/${rental.id}/edit`} size="sm" variant="secondary">
            <Pencil className="h-4 w-4" /> Editar
          </LinkButton>
        }
      />

      <Card>
        <CardContent className="flex items-center justify-between pt-4">
          <StatusBadge
            value={rental.status}
            labels={RENTAL_STATUS_LABELS}
            tones={RENTAL_STATUS_TONE}
          />
          <span className="text-sm text-muted">
            {PAYMENT_FREQUENCY_LABELS[rental.payment_frequency]}
          </span>
        </CardContent>
      </Card>

      {/* Customer & moto */}
      <div className="grid gap-3 sm:grid-cols-2">
        {customer ? (
          <Link
            href={`/app/customers/${customer.id}`}
            className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <p className="text-xs text-muted">Arrendatario</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{customer.full_name}</p>
            <p className="text-xs text-muted">{customer.phone}</p>
          </Link>
        ) : null}
        {moto ? (
          <Link
            href={`/app/motorcycles/${moto.id}`}
            className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <p className="text-xs text-muted">Moto</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {moto.brand} {moto.model}
            </p>
            <p className="text-xs text-muted">Placa {moto.plate}</p>
          </Link>
        ) : null}
      </div>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              { label: "Inicio", value: formatDate(rental.start_date) },
              { label: "Fin", value: rental.end_date ? formatDate(rental.end_date) : "Abierto" },
              { label: "Valor acordado", value: formatCOP(rental.agreed_value) },
              { label: "Frecuencia", value: PAYMENT_FREQUENCY_LABELS[rental.payment_frequency] },
              { label: "Día de pago", value: rental.payment_day ?? "—" },
              { label: "Total pagado", value: formatCOP(paidTotal) },
              { label: "Observaciones", value: rental.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-2">
        {customer ? (
          <WhatsAppButton
            phone={customer.phone}
            message={`Hola ${customer.full_name.split(" ")[0]}, sobre el alquiler de la moto ${moto ? `${moto.brand} ${moto.model}` : ""}.`}
            className="flex-1"
          />
        ) : null}
        <LinkButton
          href={`/app/payments/new?rental=${rental.id}&customer=${rental.customer_id}`}
          variant="secondary"
          className="flex-1"
        >
          <Receipt className="h-4 w-4" /> Registrar pago
        </LinkButton>
      </div>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos asociados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted">Sin pagos registrados.</p>
          ) : (
            payments.map((p) => (
              <AlertCard
                key={p.id}
                href={`/app/payments/${p.id}`}
                title={formatCOP(p.amount)}
                subtitle={p.due_date ? `Vence ${formatDate(p.due_date)}` : formatDate(p.created_at)}
                badgeLabel={PAYMENT_STATUS_LABELS[p.status]}
                tone={PAYMENT_STATUS_TONE[p.status]}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Status management */}
      {isActive ? (
        <Card>
          <CardHeader>
            <CardTitle>Gestión del alquiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={finalizeRentalAction} className="space-y-2">
              <input type="hidden" name="rental_id" value={rental.id} />
              <label className="label-base">Finalizar y dejar la moto como:</label>
              <div className="flex gap-2">
                <Select name="next_motorcycle_status" defaultValue="disponible" className="flex-1">
                  <option value="disponible">Disponible</option>
                  <option value="mantenimiento">En mantenimiento</option>
                </Select>
                <Button type="submit">Finalizar</Button>
              </div>
            </form>

            <form action={changeRentalStatusAction}>
              <input type="hidden" name="rental_id" value={rental.id} />
              <input type="hidden" name="status" value="cancelado" />
              <Button type="submit" variant="ghost" size="sm" className="text-danger hover:bg-danger/10">
                Cancelar alquiler
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
