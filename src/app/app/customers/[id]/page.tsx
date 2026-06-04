import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, FileText, FolderOpen, Pencil, Receipt } from "lucide-react";
import { getCustomer } from "@/lib/data/customers";
import { listRentals } from "@/lib/data/rentals";
import { listPayments } from "@/lib/data/payments";
import { listFines } from "@/lib/data/fines";
import { getMotorcycle } from "@/lib/data/motorcycles";
import {
  listCustomerDocuments,
  CUSTOMER_DOCUMENT_LABELS,
  CUSTOMER_DOCUMENT_TYPES,
} from "@/lib/data/customer-documents";
import { deleteCustomerAction } from "@/lib/actions/customers";
import {
  uploadCustomerDocumentAction,
  deleteCustomerDocumentAction,
} from "@/lib/actions/uploads";
import { signedUrlServer, STORAGE_BUCKETS } from "@/lib/storage-server";
import { isImageType } from "@/lib/upload";
import { FileUploadField } from "@/components/upload/FileUploadField";
import { DocumentList } from "@/components/upload/DocumentList";
import { Select } from "@/components/ui/form";
import {
  FINE_STATUS_LABELS,
  FINE_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  RENTAL_STATUS_LABELS,
  RENTAL_STATUS_TONE,
} from "@/lib/constants";
import { calcAge, formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { AlertCard } from "@/components/app/alert-card";
import { LinkButton } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/app/whatsapp-button";
import { DeleteButton } from "@/components/app/delete-button";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  const [rentals, payments, fines, documents] = await Promise.all([
    listRentals({ customerId: customer.id }),
    listPayments({ customerId: customer.id }),
    listFines({ customerId: customer.id }),
    listCustomerDocuments(customer.id),
  ]);

  const docItems = await Promise.all(
    documents.map(async (d) => ({
      id: d.id,
      label: CUSTOMER_DOCUMENT_LABELS[d.type] ?? d.type,
      signedUrl: await signedUrlServer(STORAGE_BUCKETS.customerDocuments, d.file_url),
      isImage: isImageType(d.file_url),
      deleteAction: deleteCustomerDocumentAction.bind(null, customer.id, d.id, d.file_url),
    })),
  );
  const uploadDoc = uploadCustomerDocumentAction.bind(null, customer.id);

  // Resolve moto labels for the active rentals.
  const activeRentals = rentals.filter((r) => r.status === "activo");
  const activeMotos = await Promise.all(
    activeRentals.map((r) => getMotorcycle(r.motorcycle_id)),
  );

  const pendingPayments = payments.filter(
    (p) => p.status === "pendiente" || p.status === "vencido" || p.status === "parcial",
  );
  const pendingTotal = pendingPayments.reduce((s, p) => s + p.amount, 0);

  const deleteAction = deleteCustomerAction.bind(null, customer.id);
  const waMessage = `Hola ${customer.full_name.split(" ")[0]}, te escribo de Moto Rental.`;

  return (
    <div className="space-y-5">
      <PageHeader
        title={customer.full_name}
        subtitle={`${customer.document_type} ${customer.document_number}`}
        backHref="/app/customers"
        action={
          <LinkButton href={`/app/customers/${customer.id}/edit`} size="sm" variant="secondary">
            <Pencil className="h-4 w-4" /> Editar
          </LinkButton>
        }
      />

      {/* Quick actions */}
      <div className="flex gap-2">
        <WhatsAppButton phone={customer.phone} message={waMessage} className="flex-1" />
        <LinkButton
          href={`/app/payments/new?customer=${customer.id}`}
          variant="secondary"
          className="flex-1"
        >
          <Receipt className="h-4 w-4" /> Registrar pago
        </LinkButton>
      </div>

      {/* Financial summary */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4">
          <div className="rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-xs text-muted">Saldo pendiente</p>
            <p className={`mt-1 text-xl font-bold ${pendingTotal > 0 ? "text-danger" : "text-success"}`}>
              {formatCOP(pendingTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-xs text-muted">Motos activas</p>
            <p className="mt-1 text-xl font-bold text-info">{activeRentals.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal data */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              { label: "Nacionalidad", value: customer.nationality },
              {
                label: "Edad",
                value: calcAge(customer.birth_date) ? `${calcAge(customer.birth_date)} años` : "—",
              },
              { label: "Teléfono", value: customer.phone },
              { label: "Dirección", value: customer.address ?? "—" },
              { label: "Licencia", value: customer.license_number ?? "—" },
              { label: "Categoría", value: customer.license_category ?? "—" },
              { label: "Referencias", value: customer.references_info ?? "—" },
              { label: "Observaciones", value: customer.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-brand" /> Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DocumentList
            items={docItems}
            emptyText="Este arrendatario aún no tiene documentos cargados."
          />
          <FileUploadField
            action={uploadDoc}
            buttonLabel="Subir documento"
            hint="JPG, PNG, WEBP o PDF, hasta 5 MB. Datos sensibles: almacenamiento privado."
            testId="upload-customer-document"
          >
            <Select name="type" aria-label="Tipo de documento" defaultValue="licencia">
              {CUSTOMER_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CUSTOMER_DOCUMENT_LABELS[t]}
                </option>
              ))}
            </Select>
          </FileUploadField>
        </CardContent>
      </Card>

      {/* Active motorcycles */}
      {activeRentals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Motos alquiladas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeRentals.map((r, i) => {
              const moto = activeMotos[i];
              return (
                <AlertCard
                  key={r.id}
                  href={`/app/rentals/${r.id}`}
                  title={moto ? `${moto.brand} ${moto.model} · ${moto.plate}` : "Moto"}
                  subtitle={`Desde ${formatDate(r.start_date)} · ${formatCOP(r.agreed_value)}`}
                  tone="info"
                  badgeLabel="Activo"
                />
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pagos</CardTitle>
          <Link href={`/app/payments/new?customer=${customer.id}`} className="text-xs font-medium text-brand hover:underline">
            + Registrar
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted">Sin pagos registrados.</p>
          ) : (
            payments.slice(0, 8).map((p) => (
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

      {/* Rental history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand" /> Historial de alquileres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rentals.length === 0 ? (
            <p className="text-sm text-muted">Sin alquileres.</p>
          ) : (
            rentals.map((r) => (
              <AlertCard
                key={r.id}
                href={`/app/rentals/${r.id}`}
                title={`${formatDate(r.start_date)} → ${r.end_date ? formatDate(r.end_date) : "Actual"}`}
                subtitle={formatCOP(r.agreed_value)}
                badgeLabel={RENTAL_STATUS_LABELS[r.status]}
                tone={RENTAL_STATUS_TONE[r.status]}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Fines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-brand" /> Multas asociadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fines.length === 0 ? (
            <p className="text-sm text-muted">Sin multas asociadas.</p>
          ) : (
            fines.map((f) => (
              <AlertCard
                key={f.id}
                href={`/app/fines/${f.id}`}
                title={f.reason}
                subtitle={`${formatDate(f.date)} · ${formatCOP(f.amount)}`}
                badgeLabel={FINE_STATUS_LABELS[f.status]}
                tone={FINE_STATUS_TONE[f.status]}
              />
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <DeleteButton
          action={deleteAction}
          label="Eliminar cliente"
          confirmText="El cliente quedará inactivo."
        />
      </div>
    </div>
  );
}
