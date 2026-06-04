import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FilePlus2,
  KeyRound,
  Receipt,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getDashboardStats, listExpirations } from "@/lib/data/analytics";
import {
  formatCOP,
  formatCOPCompact,
  formatDateLong,
  relativeExpiry,
  todayISO,
} from "@/lib/utils";
import type { Tone } from "@/lib/utils";
import { StatCard } from "@/components/app/stat-card";
import { AlertCard } from "@/components/app/alert-card";
import { InstallAppPrompt } from "@/components/app/install-app-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_NAME } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

function expTone(daysLeft: number): Tone {
  if (daysLeft < 0) return "danger";
  if (daysLeft <= 7) return "warning";
  return "success";
}

const KIND_LABEL: Record<string, string> = {
  soat: "SOAT",
  tecnomecanica: "Tecnomecánica",
  impuestos: "Impuestos",
  cambio_aceite: "Cambio de aceite",
  mantenimiento: "Mantenimiento",
  pago: "Pago",
};

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app/motorcycles/new", label: "Nueva moto", icon: Bike },
  { href: "/app/customers/new", label: "Nuevo cliente", icon: UserPlus },
  { href: "/app/rentals/new", label: "Nuevo alquiler", icon: FilePlus2 },
  { href: "/app/payments/new", label: "Registrar pago", icon: Receipt },
  { href: "/app/fines/new", label: "Registrar multa", icon: AlertTriangle },
];

export default async function DashboardPage() {
  const [stats, expirations] = await Promise.all([
    getDashboardStats(),
    listExpirations(),
  ]);

  const upcomingDocs = expirations.filter((e) => e.kind !== "pago").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted capitalize">{formatDateLong(todayISO())}</p>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, Propietario 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Centro de control de {BUSINESS_NAME}: tu flota, pagos y vencimientos en
          un vistazo.
        </p>
      </div>

      {/* Install PWA (Android/Chrome; discreto y descartable) */}
      <InstallAppPrompt />

      {/* Quick actions */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface px-2 py-3 text-center transition-colors hover:border-brand/50 hover:bg-surface-2 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium leading-tight text-foreground">
                  {a.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total de motos"
          value={stats.totalMotorcycles}
          icon={Bike}
          tone="neutral"
          href="/app/motorcycles"
        />
        <StatCard
          label="Alquiladas"
          value={stats.rented}
          hint={`${stats.available} disponibles`}
          icon={KeyRound}
          tone="info"
          href="/app/motorcycles?status=alquilada"
        />
        <StatCard
          label="Ingresos del mes"
          value={formatCOPCompact(stats.incomeMonth)}
          hint="Pagos registrados"
          icon={CircleDollarSign}
          tone="success"
          href="/app/reports"
        />
      </div>

      {/* Fleet status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la flota</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FleetStat label="Disponibles" value={stats.available} tone="success" />
          <FleetStat label="Alquiladas" value={stats.rented} tone="info" />
          <FleetStat label="Mantenimiento" value={stats.maintenance} tone="warning" />
          <FleetStat label="Inactivas" value={stats.inactive} tone="neutral" />
        </CardContent>
      </Card>

      {/* Alerts: payments, maintenance, fines */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Pagos pendientes"
          value={stats.pendingPaymentsCount}
          hint={formatCOP(stats.pendingPaymentsAmount)}
          tone={stats.pendingPaymentsCount > 0 ? "danger" : "success"}
          icon={CircleDollarSign}
          href="/app/payments?status=pendiente"
        />
        <StatCard
          label="Mantenimientos"
          value={stats.upcomingMaintenance}
          hint="Próximos 7 días"
          tone={stats.upcomingMaintenance > 0 ? "warning" : "success"}
          icon={Wrench}
          href="/app/maintenance"
        />
        <StatCard
          label="Multas pendientes"
          value={stats.finesPendingCount}
          hint={formatCOP(stats.finesPendingAmount)}
          tone={stats.finesPendingCount > 0 ? "warning" : "success"}
          icon={AlertTriangle}
          href="/app/fines?status=pendiente"
        />
      </div>

      {/* Upcoming expirations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximos vencimientos</CardTitle>
          <Link
            href="/app/expirations"
            className="text-xs font-medium text-brand hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingDocs.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-4 text-sm text-muted">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Todo al día. No hay vencimientos próximos.
            </div>
          ) : (
            upcomingDocs.map((e) => (
              <AlertCard
                key={e.id}
                title={`${KIND_LABEL[e.kind] ?? e.kind} · ${e.subtitle}`}
                subtitle={relativeExpiry(e.date)}
                badgeLabel={e.daysLeft < 0 ? "Vencido" : `${e.daysLeft}d`}
                tone={expTone(e.daysLeft)}
                href={e.motorcycleId ? `/app/motorcycles/${e.motorcycleId}` : undefined}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Calendar shortcut */}
      <Link
        href="/app/payments"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Calendario de pagos
            </p>
            <p className="text-xs text-muted">Revisa y registra pagos por fecha</p>
          </div>
        </div>
        <span className="text-brand">→</span>
      </Link>
    </div>
  );
}

function FleetStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const colors: Record<Tone, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
    neutral: "text-muted",
  };
  return (
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
