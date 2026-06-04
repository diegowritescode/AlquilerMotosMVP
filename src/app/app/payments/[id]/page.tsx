import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getPayment } from "@/lib/data/payments";
import { getCustomer } from "@/lib/data/customers";
import { markPaidAction } from "@/lib/actions/payments";
import { uploadPaymentEvidenceAction } from "@/lib/actions/uploads";
import { signedUrlServer, STORAGE_BUCKETS } from "@/lib/storage-server";
import { isImageType } from "@/lib/upload";
import { FileUploadField } from "@/components/upload/FileUploadField";
import { EvidenceViewer } from "@/components/upload/EvidenceViewer";
import { Receipt } from "lucide-react";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { StatusBadge } from "@/components/app/status-badge";
import { Button, LinkButton } from "@/components/ui/button";

export default async function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const payment = await getPayment(params.id);
  if (!payment) notFound();

  const customer = await getCustomer(payment.customer_id);
  const canMarkPaid = payment.status !== "pagado";

  const evidenceUrl = payment.evidence_url
    ? await signedUrlServer(STORAGE_BUCKETS.paymentEvidence, payment.evidence_url)
    : null;
  const uploadEvidence = uploadPaymentEvidenceAction.bind(null, payment.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detalle del pago"
        subtitle={customer?.full_name}
        backHref="/app/payments"
        action={
          <LinkButton href={`/app/payments/${payment.id}/edit`} size="sm" variant="secondary">
            <Pencil className="h-4 w-4" /> Editar
          </LinkButton>
        }
      />

      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-foreground">
            {formatCOP(payment.amount)}
          </p>
          <div className="mt-2 flex justify-center">
            <StatusBadge
              value={payment.status}
              labels={PAYMENT_STATUS_LABELS}
              tones={PAYMENT_STATUS_TONE}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              {
                label: "Arrendatario",
                value: customer ? (
                  <Link href={`/app/customers/${customer.id}`} className="text-brand hover:underline">
                    {customer.full_name}
                  </Link>
                ) : "—",
              },
              {
                label: "Alquiler",
                value: payment.rental_id ? (
                  <Link href={`/app/rentals/${payment.rental_id}`} className="text-brand hover:underline">
                    Ver alquiler
                  </Link>
                ) : "—",
              },
              { label: "Método", value: PAYMENT_METHOD_LABELS[payment.method] },
              { label: "Vencimiento", value: formatDate(payment.due_date) },
              { label: "Pagado el", value: formatDate(payment.paid_at) },
              { label: "Referencia", value: payment.reference ?? "—" },
              { label: "Observaciones", value: payment.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Comprobante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand" /> Comprobante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EvidenceViewer
            signedUrl={evidenceUrl}
            isImage={payment.evidence_url ? isImageType(payment.evidence_url) : false}
            emptyText="Sin comprobante adjunto."
          />
          <FileUploadField
            action={uploadEvidence}
            buttonLabel="Subir comprobante"
            hint="JPG, PNG, WEBP o PDF, hasta 5 MB. Registro interno; el cobro se gestiona por fuera."
            testId="upload-payment-evidence"
          />
        </CardContent>
      </Card>

      {canMarkPaid ? (
        <form action={markPaidAction}>
          <input type="hidden" name="payment_id" value={payment.id} />
          <Button type="submit" className="w-full" size="lg">
            Marcar como pagado hoy
          </Button>
        </form>
      ) : null}
    </div>
  );
}
