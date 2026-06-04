import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Pencil } from "lucide-react";
import { getFine } from "@/lib/data/fines";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { getCustomer } from "@/lib/data/customers";
import { FINE_STATUS_LABELS, FINE_STATUS_TONE } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { StatusBadge } from "@/components/app/status-badge";
import { LinkButton } from "@/components/ui/button";

export default async function FineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const fine = await getFine(params.id);
  if (!fine) notFound();

  const [moto, customer] = await Promise.all([
    getMotorcycle(fine.motorcycle_id),
    fine.customer_id ? getCustomer(fine.customer_id) : Promise.resolve(null),
  ]);

  const hasCoords = typeof fine.lat === "number" && typeof fine.lng === "number";

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
            <StatusBadge value={fine.status} labels={FINE_STATUS_LABELS} tones={FINE_STATUS_TONE} />
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
              { label: "Observaciones", value: fine.notes ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Map placeholder — full Leaflet/OpenStreetMap map is Fase 2 (whitepaper §14.4). */}
      {hasCoords ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" /> Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-surface-2 text-center text-muted">
              <MapPin className="h-8 w-8 text-brand/60" />
              <p className="mt-2 text-sm">
                {fine.lat?.toFixed(5)}, {fine.lng?.toFixed(5)}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${fine.lat}&mlon=${fine.lng}#map=16/${fine.lat}/${fine.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-brand hover:underline"
              >
                Ver en OpenStreetMap →
              </a>
            </div>
            <p className="mt-2 text-xs text-muted">
              El mapa interactivo de fotomultas se incorporará en la Fase 2.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
