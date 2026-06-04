import {
  AlertTriangle,
  Bike,
  CircleDollarSign,
  Users,
  Wrench,
} from "lucide-react";
import { getReportData } from "@/lib/data/analytics";
import {
  MOTORCYCLE_STATUS_LABELS,
  MOTORCYCLE_STATUS_TONE,
} from "@/lib/constants";
import { formatCOP } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Reportes" };

export default async function ReportsPage() {
  const r = await getReportData();

  return (
    <div className="space-y-5">
      <PageHeader title="Reportes" subtitle="Resumen operativo y financiero" />

      {/* Income */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Ingresos totales" value={formatCOP(r.incomeTotal)} icon={CircleDollarSign} tone="success" />
        <StatCard label="Ingresos del mes" value={formatCOP(r.incomeMonth)} tone="neutral" />
        <StatCard label="Ingresos de la semana" value={formatCOP(r.incomeWeek)} tone="neutral" />
      </div>

      {/* Pending & utilization */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Pagos pendientes"
          value={r.pendingCount}
          hint={formatCOP(r.pendingAmount)}
          tone={r.pendingCount > 0 ? "danger" : "success"}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Utilización de flota"
          value={`${r.utilization.percent}%`}
          hint={`${r.utilization.rented}/${r.utilization.total} alquiladas`}
          icon={Bike}
          tone="info"
        />
      </div>

      {/* Operational */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Mantenimientos pendientes" value={r.maintenancePending} icon={Wrench} tone={r.maintenancePending > 0 ? "warning" : "success"} />
        <StatCard label="Multas pendientes" value={r.finesPending} hint={formatCOP(r.finesPendingAmount)} icon={AlertTriangle} tone={r.finesPending > 0 ? "warning" : "success"} />
        <StatCard label="Clientes activos" value={r.activeCustomers} icon={Users} tone="neutral" />
      </div>

      {/* Motos by status */}
      <Card>
        <CardHeader>
          <CardTitle>Motos por estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(r.motosByStatus).length === 0 ? (
            <p className="text-sm text-muted">Sin motos registradas.</p>
          ) : (
            Object.entries(r.motosByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
                <Badge tone={MOTORCYCLE_STATUS_TONE[status] ?? "neutral"}>
                  {MOTORCYCLE_STATUS_LABELS[status] ?? status}
                </Badge>
                <span className="text-sm font-semibold text-foreground">{count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="px-1 text-xs text-muted">
        Los reportes avanzados (rentabilidad por moto, mora por cliente,
        tendencias e integración contable) se incorporan en fases posteriores.
        Exportación CSV/Excel está en el roadmap de Fase 2.
      </p>
    </div>
  );
}
