import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Receipt } from "lucide-react";
import { listPayments } from "@/lib/data/payments";
import { listCustomers } from "@/lib/data/customers";
import type { PaymentStatus } from "@/lib/types";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { FilterTabs } from "@/components/app/filter-tabs";
import { AlertCard } from "@/components/app/alert-card";
import { EmptyState } from "@/components/app/empty-state";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Pagos" };

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "vencido", label: "Vencidos" },
  { value: "parcial", label: "Parciales" },
  { value: "pagado", label: "Pagados" },
  { value: "en_acuerdo", label: "En acuerdo" },
];

function monthKey(p: { due_date?: string | null; created_at: string }): string {
  const ref = p.due_date ?? p.created_at;
  try {
    return format(parseISO(ref), "MMMM yyyy", { locale: es });
  } catch {
    return "Sin fecha";
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (searchParams.status as PaymentStatus | "todos") ?? "todos";
  const [payments, customers] = await Promise.all([
    listPayments({ status }),
    listCustomers(),
  ]);
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Group by month of due date for a calendar-like view.
  const groups = new Map<string, typeof payments>();
  for (const p of payments) {
    const key = monthKey(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pagos"
        subtitle={`Registro interno · ${payments.length} ${payments.length === 1 ? "pago" : "pagos"}`}
        action={
          <LinkButton href="/app/payments/new" size="sm">
            <Plus className="h-4 w-4" /> Registrar
          </LinkButton>
        }
      />

      <FilterTabs options={FILTERS} defaultValue="todos" />

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aún no hay pagos"
          description="Registra el primer pago de un alquiler. Así llevas el control de lo que está al día, pendiente o vencido, con su comprobante."
          actionLabel="Registrar pago"
          actionHref="/app/payments/new"
        />
      ) : (
        <div className="space-y-5">
          {Array.from(groups.entries()).map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {month}
              </h2>
              <div className="space-y-2">
                {items.map((p) => {
                  const customer = customerMap.get(p.customer_id);
                  return (
                    <AlertCard
                      key={p.id}
                      href={`/app/payments/${p.id}`}
                      title={`${formatCOP(p.amount)} · ${customer?.full_name ?? "Cliente"}`}
                      subtitle={`${PAYMENT_METHOD_LABELS[p.method]} · ${p.due_date ? `vence ${formatDate(p.due_date)}` : formatDate(p.created_at)}`}
                      badgeLabel={PAYMENT_STATUS_LABELS[p.status]}
                      tone={PAYMENT_STATUS_TONE[p.status]}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
