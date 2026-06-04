import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Bike, Camera, FileText, Pencil, Wrench } from "lucide-react";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { listRentals } from "@/lib/data/rentals";
import { getCustomer } from "@/lib/data/customers";
import { listMaintenance } from "@/lib/data/maintenance";
import { listFines } from "@/lib/data/fines";
import { listMotorcyclePhotos } from "@/lib/data/motorcycle-photos";
import { deleteMotorcycleAction } from "@/lib/actions/motorcycles";
import {
  uploadMotorcyclePhotoAction,
  deleteMotorcyclePhotoAction,
} from "@/lib/actions/uploads";
import { signedUrlServer, STORAGE_BUCKETS } from "@/lib/storage-server";
import { FileUploadField } from "@/components/upload/FileUploadField";
import { ImagePreviewGrid } from "@/components/upload/ImagePreviewGrid";
import {
  CONDITION_LABELS,
  CONDITION_TONE,
  FINE_STATUS_LABELS,
  FINE_STATUS_TONE,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_TONE,
  MAINTENANCE_TYPE_LABELS,
  MOTORCYCLE_STATUS_LABELS,
  MOTORCYCLE_STATUS_TONE,
  RENTAL_STATUS_LABELS,
  RENTAL_STATUS_TONE,
} from "@/lib/constants";
import { formatCOP, formatDate, relativeExpiry } from "@/lib/utils";
import type { Tone } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/app/status-badge";
import { InfoList } from "@/components/app/info-list";
import { AlertCard } from "@/components/app/alert-card";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/app/delete-button";

function expTone(date?: string | null): Tone {
  const d = date ? Math.ceil((new Date(date).getTime() - Date.now()) / 86400000) : null;
  if (d === null) return "neutral";
  if (d < 0) return "danger";
  if (d <= 7) return "warning";
  return "success";
}

export default async function MotorcycleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const moto = await getMotorcycle(params.id);
  if (!moto) notFound();

  const [rentals, maintenance, fines, photos] = await Promise.all([
    listRentals({ motorcycleId: moto.id }),
    listMaintenance({ motorcycleId: moto.id }),
    listFines({ motorcycleId: moto.id }),
    listMotorcyclePhotos(moto.id),
  ]);

  const gallery = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      signedUrl: await signedUrlServer(STORAGE_BUCKETS.motorcyclePhotos, p.file_url),
      deleteAction: deleteMotorcyclePhotoAction.bind(null, moto.id, p.id, p.file_url),
    })),
  );
  const uploadPhoto = uploadMotorcyclePhotoAction.bind(null, moto.id);

  const activeRental = rentals.find((r) => r.status === "activo");
  const activeCustomer = activeRental
    ? await getCustomer(activeRental.customer_id)
    : null;

  const expirations = [
    { label: "SOAT", date: moto.soat_expiration },
    { label: "Tecnomecánica", date: moto.tecnomecanica_expiration },
    { label: "Impuestos", date: moto.tax_expiration },
    { label: "Cambio de aceite", date: moto.next_oil_change_date },
  ].filter((e) => e.date);

  const deleteAction = deleteMotorcycleAction.bind(null, moto.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${moto.brand} ${moto.model}`}
        subtitle={`Placa ${moto.plate}`}
        backHref="/app/motorcycles"
        action={
          <LinkButton href={`/app/motorcycles/${moto.id}/edit`} size="sm" variant="secondary">
            <Pencil className="h-4 w-4" /> Editar
          </LinkButton>
        }
      />

      {/* Header card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-brand">
            <Bike className="h-10 w-10" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge
                value={moto.current_status}
                labels={MOTORCYCLE_STATUS_LABELS}
                tones={MOTORCYCLE_STATUS_TONE}
              />
              <span className="text-xs text-muted">{moto.year}</span>
            </div>
            <p className="mt-2 text-lg font-bold text-brand">
              {formatCOP(moto.weekly_price)}{" "}
              <span className="text-xs font-normal text-muted">/ semana</span>
            </p>
            <p className="text-xs text-muted">
              {formatCOP(moto.daily_price)} día · {formatCOP(moto.monthly_price)} mes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-brand" /> Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ImagePreviewGrid
            items={gallery}
            emptyText="Esta moto aún no tiene fotos registradas."
          />
          <FileUploadField
            action={uploadPhoto}
            buttonLabel="Subir foto"
            hint="JPG, PNG o WEBP, hasta 5 MB."
            testId="upload-motorcycle-photo"
          />
        </CardContent>
      </Card>

      {/* Technical info */}
      <Card>
        <CardHeader>
          <CardTitle>Información técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              { label: "Cilindraje", value: `${moto.cc} cc` },
              { label: "Color", value: moto.color },
              { label: "Kilometraje", value: `${moto.mileage.toLocaleString("es-CO")} km` },
              {
                label: "Estado general",
                value: (
                  <Badge tone={CONDITION_TONE[moto.general_condition]}>
                    {CONDITION_LABELS[moto.general_condition]}
                  </Badge>
                ),
              },
              {
                label: "Motor",
                value: (
                  <Badge tone={CONDITION_TONE[moto.engine_condition]}>
                    {CONDITION_LABELS[moto.engine_condition]}
                  </Badge>
                ),
              },
              {
                label: "Llantas",
                value: (
                  <Badge tone={CONDITION_TONE[moto.tires_condition]}>
                    {CONDITION_LABELS[moto.tires_condition]}
                  </Badge>
                ),
              },
              { label: "Observaciones", value: moto.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Current renter */}
      {activeRental && activeCustomer ? (
        <Card>
          <CardHeader>
            <CardTitle>Arrendatario actual</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/app/customers/${activeCustomer.id}`}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {activeCustomer.full_name}
                </p>
                <p className="text-xs text-muted">
                  Desde {formatDate(activeRental.start_date)} ·{" "}
                  {formatCOP(activeRental.agreed_value)}
                </p>
              </div>
              <span className="text-brand">→</span>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Expirations */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos vencimientos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {expirations.length === 0 ? (
            <p className="text-sm text-muted">Sin fechas de vencimiento registradas.</p>
          ) : (
            expirations.map((e) => (
              <AlertCard
                key={e.label}
                title={e.label}
                subtitle={`Vence ${formatDate(e.date)}`}
                badgeLabel={relativeExpiry(e.date)}
                tone={expTone(e.date)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* History: maintenance */}
      <HistorySection
        title="Mantenimientos"
        icon={Wrench}
        emptyText="Sin mantenimientos registrados."
        addHref={`/app/maintenance/new?motorcycle=${moto.id}`}
      >
        {maintenance.slice(0, 5).map((m) => (
          <AlertCard
            key={m.id}
            title={MAINTENANCE_TYPE_LABELS[m.type] ?? m.type}
            subtitle={`${formatDate(m.date)}${m.cost ? ` · ${formatCOP(m.cost)}` : ""}`}
            badgeLabel={MAINTENANCE_STATUS_LABELS[m.status]}
            tone={MAINTENANCE_STATUS_TONE[m.status]}
          />
        ))}
      </HistorySection>

      {/* History: rentals */}
      <HistorySection
        title="Alquileres"
        icon={FileText}
        emptyText="Sin alquileres registrados."
      >
        {rentals.slice(0, 5).map((r) => (
          <AlertCard
            key={r.id}
            href={`/app/rentals/${r.id}`}
            title={`${formatDate(r.start_date)} → ${r.end_date ? formatDate(r.end_date) : "Actual"}`}
            subtitle={formatCOP(r.agreed_value)}
            badgeLabel={RENTAL_STATUS_LABELS[r.status]}
            tone={RENTAL_STATUS_TONE[r.status]}
          />
        ))}
      </HistorySection>

      {/* History: fines */}
      <HistorySection
        title="Fotomultas / infracciones"
        icon={AlertTriangle}
        emptyText="Sin multas registradas."
        addHref={`/app/fines/new?motorcycle=${moto.id}`}
      >
        {fines.slice(0, 5).map((f) => (
          <AlertCard
            key={f.id}
            href={`/app/fines/${f.id}`}
            title={f.reason}
            subtitle={`${formatDate(f.date)} · ${formatCOP(f.amount)}`}
            badgeLabel={FINE_STATUS_LABELS[f.status]}
            tone={FINE_STATUS_TONE[f.status]}
          />
        ))}
      </HistorySection>

      {/* Danger zone */}
      <div className="flex justify-end pt-2">
        <DeleteButton
          action={deleteAction}
          label="Eliminar moto"
          confirmText="La moto quedará inactiva."
        />
      </div>
    </div>
  );
}

function HistorySection({
  title,
  icon: Icon,
  emptyText,
  addHref,
  children,
}: {
  title: string;
  icon: typeof Wrench;
  emptyText: string;
  addHref?: string;
  children: React.ReactNode[];
}) {
  const hasItems = Array.isArray(children) && children.length > 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" /> {title}
        </CardTitle>
        {addHref ? (
          <Link href={addHref} className="text-xs font-medium text-brand hover:underline">
            + Agregar
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {hasItems ? children : <p className="text-sm text-muted">{emptyText}</p>}
      </CardContent>
    </Card>
  );
}
