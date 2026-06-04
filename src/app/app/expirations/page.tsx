import { CheckCircle2 } from "lucide-react";
import { listExpirations } from "@/lib/data/analytics";
import type { ExpirationItem } from "@/lib/types";
import type { Tone } from "@/lib/utils";
import { formatCOP, formatDate, relativeExpiry } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { AlertCard } from "@/components/app/alert-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Vencimientos" };

const KIND_LABEL: Record<string, string> = {
  soat: "SOAT",
  tecnomecanica: "Tecnomecánica",
  impuestos: "Impuestos",
  cambio_aceite: "Cambio de aceite",
  mantenimiento: "Mantenimiento",
  pago: "Pago",
};

function tone(daysLeft: number): Tone {
  if (daysLeft < 0) return "danger";
  if (daysLeft <= 7) return "warning";
  return "success";
}

/** Where to go to RESOLVE each kind of expiration. */
function hrefFor(e: ExpirationItem): string | undefined {
  if (e.kind === "pago") {
    return e.paymentId ? `/app/payments/${e.paymentId}` : undefined;
  }
  // Documentos y mantenimiento: en la ficha de la moto (allí se actualizan
  // las fechas / se ve el historial).
  return e.motorcycleId ? `/app/motorcycles/${e.motorcycleId}` : undefined;
}

/** Tiny hint on how to mark it resolved. */
function actionHintFor(kind: ExpirationItem["kind"]): string {
  if (kind === "pago") return " · toca para marcar pagado";
  if (kind === "mantenimiento") return " · toca para ver la moto";
  return " · toca para actualizar la fecha";
}

function Group({
  title,
  items,
  accent,
}: {
  title: string;
  items: ExpirationItem[];
  accent: Tone;
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-muted">{items.length}</span>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((e) => (
          <AlertCard
            key={e.id}
            href={hrefFor(e)}
            title={`${KIND_LABEL[e.kind] ?? e.kind} · ${e.subtitle}`}
            subtitle={`${formatDate(e.date)} · ${relativeExpiry(e.date)}${e.amount ? ` · ${formatCOP(e.amount)}` : ""}${actionHintFor(e.kind)}`}
            badgeLabel={e.daysLeft < 0 ? "Vencido" : `${e.daysLeft}d`}
            tone={tone(e.daysLeft)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default async function ExpirationsPage() {
  const all = await listExpirations();

  const overdue = all.filter((e) => e.daysLeft < 0);
  const in7 = all.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 7);
  const in15 = all.filter((e) => e.daysLeft > 7 && e.daysLeft <= 15);
  const in30 = all.filter((e) => e.daysLeft > 15 && e.daysLeft <= 30);

  const hasAny = overdue.length + in7.length + in15.length + in30.length > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vencimientos y alertas"
        subtitle="SOAT, tecnomecánica, impuestos, aceite, mantenimiento y pagos"
      />

      <p className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-muted">
        Toca una alerta para resolverla: los <strong>documentos</strong> se
        renuevan actualizando su fecha en la ficha de la moto; un{" "}
        <strong>pago</strong> se marca como pagado en su detalle.
      </p>

      {!hasAny ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-6 text-sm text-muted">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Todo al día. No hay vencimientos en los próximos 30 días.
        </div>
      ) : (
        <>
          <Group title="Vencidos" items={overdue} accent="danger" />
          <Group title="Próximos 7 días" items={in7} accent="warning" />
          <Group title="Próximos 15 días" items={in15} accent="warning" />
          <Group title="Próximos 30 días" items={in30} accent="success" />
        </>
      )}
    </div>
  );
}
