import { Plus, Users } from "lucide-react";
import { listCustomers } from "@/lib/data/customers";
import { listPayments } from "@/lib/data/payments";
import { calcAge } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/search-input";
import { EntityCard, IconThumb } from "@/components/app/entity-card";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Arrendatarios" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const [customers, payments] = await Promise.all([
    listCustomers({ search: searchParams.q }),
    listPayments(),
  ]);

  // Pre-compute who has overdue/pending payments for a quick financial flag.
  const inArrears = new Set(
    payments
      .filter((p) => p.status === "vencido" || p.status === "pendiente")
      .map((p) => p.customer_id),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Arrendatarios"
        subtitle={`${customers.length} ${customers.length === 1 ? "cliente" : "clientes"}`}
        action={
          <LinkButton href="/app/customers/new" size="sm">
            <Plus className="h-4 w-4" /> Agregar
          </LinkButton>
        }
      />

      <SearchInput placeholder="Buscar por nombre, documento o teléfono" />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin arrendatarios"
          description="Agrega tu primer cliente para registrar alquileres y pagos."
          actionLabel="Agregar cliente"
          actionHref="/app/customers/new"
        />
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const age = calcAge(c.birth_date);
            return (
              <EntityCard
                key={c.id}
                href={`/app/customers/${c.id}`}
                thumbnail={
                  <IconThumb>
                    <span className="text-base font-bold">
                      {c.full_name.charAt(0).toUpperCase()}
                    </span>
                  </IconThumb>
                }
                title={c.full_name}
                lines={[
                  `${c.document_type} ${c.document_number}${age ? ` · ${age} años` : ""}`,
                  `Tel. ${c.phone}`,
                ]}
                right={
                  inArrears.has(c.id) ? (
                    <Badge tone="danger">Con saldo</Badge>
                  ) : (
                    <Badge tone="success">Al día</Badge>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
