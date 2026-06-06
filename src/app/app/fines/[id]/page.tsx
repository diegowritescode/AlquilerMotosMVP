import Link from "next/link";
import { notFound } from "next/navigation";
import { FileWarning, MapPin, Pencil } from "lucide-react";
import { getFine } from "@/lib/data/fines";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { getCustomer } from "@/lib/data/customers";
import { getCamera } from "@/lib/data/cameras";
import { updateFineStatusAction } from "@/lib/actions/fines";
import { FINE_STATUSES } from "@/lib/types";
import { FINE_STATUS_LABELS, FINE_STATUS_TONE } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { QuickStatusSelect } from "@/components/app/quick-status-select";
import { LinkButton } from "@/components/ui/button";
import { FinesMap } from "@/components/maps/FinesMap";
import { osmLink } from "@/components/maps/map-utils";
import { uploadFineEvidenceAction } from "@/lib/actions/uploads";
import { signedUrlServer, STORAGE_BUCKETS } from "@/lib/storage-server";
import { isImageType } from "@/lib/upload";
import { FileUploadField } from "@/components/upload/FileUploadField";
import { EvidenceViewer } from "@/components/upload/EvidenceViewer";

export default async function FineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const fine = await getFine(params.id);
  if (!fine) notFound();

  const [moto, customer, camera] = await Promise.all([
    getMotorcycle(fine.motorcycle_id),
    fine.customer_id ? getCustomer(fine.customer_id) : Promise.resolve(null),
    fine.camera_id ? getCamera(fine.camera_id) : Promise.resolve(null),
  ]);

  const hasCoords = typeof fine.lat === "number" && typeof fine.lng === "number";

  const evidenceUrl = fine.evidence_url
    ? await signedUrlServer(STORAGE_BUCKETS.fineEvidence, fine.evidence_url)
    : null;
  const uploadEvidence = uploadFineEvidenceAction.bind(null, fine.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detalle de la multa"
        subtitle={fine.reason}
        backHref="/app/fines"
        action={
          <LinkButton href={`/app/fines/${fine.id}/edit`} size="sm" variant="secondary">
            <Pencil className="h-4 w-4" /> Editar
          </LinkButton>
        }
      />

      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-3xl font-bold text-foreground">{formatCOP(fine.amount)}</p>
          <div className="mt-2 flex justify-center">
            <QuickStatusSelect
              value={fine.status}
              options={FINE_STATUSES.map((s) => ({ value: s, label: FINE_STATUS_LABELS[s] ?? s }))}
              tones={FINE_STATUS_TONE}
              action={updateFineStatusAction.bind(null, fine.id)}
              ariaLabel="Cambiar estado de la multa"
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
                label: "Moto",
                value: moto ? (
                  <Link href={`/app/motorcycles/${moto.id}`} className="text-brand hover:underline">
                    {moto.brand} {moto.model} · {moto.plate}
                  </Link>
                ) : "—",
              },
              {
                label: "Responsable",
                value: customer ? (
                  <Link href={`/app/customers/${customer.id}`} className="text-brand hover:underline">
                    {customer.full_name}
                  </Link>
                ) : "Sin asignar",
              },
              { label: "Fecha", value: formatDate(fine.date) },
              { label: "Motivo", value: fine.reason },
              { label: "Ubicación", value: fine.location_text ?? "—" },
              {
                label: "Cámara",
                value: camera ? (
                  <Link href={`/app/fines/cameras/${camera.id}/edit`} className="text-brand hover:underline">
                    {camera.name}
                  </Link>
                ) : "—",
              },
              { label: "Observaciones", value: fine.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Evidencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-brand" /> Evidencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EvidenceViewer
            signedUrl={evidenceUrl}
            isImage={fine.evidence_url ? isImageType(fine.evidence_url) : false}
            emptyText="Sin evidencia adjunta."
          />
          <FileUploadField
            action={uploadEvidence}
            buttonLabel="Subir evidencia"
            hint="Captura, foto o PDF de soporte, hasta 5 MB."
            testId="upload-fine-evidence"
          />
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" /> Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCoords ? (
            <>
              <FinesMap
                fines={[
                  {
                    id: fine.id,
                    lat: fine.lat as number,
                    lng: fine.lng as number,
                    motoLabel: moto
                      ? `${moto.brand} ${moto.model} · ${moto.plate}`
                      : "Moto",
                    customerLabel: customer?.full_name ?? null,
                    reason: fine.reason,
                    amount: fine.amount,
                    status: fine.status,
                    statusLabel: FINE_STATUS_LABELS[fine.status] ?? fine.status,
                    date: fine.date,
                  },
                ]}
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>
                  {(fine.lat as number).toFixed(5)},{" "}
                  {(fine.lng as number).toFixed(5)}
                </span>
                <a
                  href={osmLink(fine.lat as number, fine.lng as number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  Ver en OpenStreetMap →
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              Esta fotomulta aún no tiene ubicación registrada. Edítala para
              seleccionar un punto en el mapa.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
