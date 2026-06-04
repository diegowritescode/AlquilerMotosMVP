import Link from "next/link";
import { CheckCircle2, Database, MessageCircle, ShieldCheck, XCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { businessWhatsapp } from "@/lib/whatsapp";
import { listAuditLogs } from "@/lib/data/audit";
import { getBusinessSettings } from "@/lib/data/business-settings";
import { humanize } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoList } from "@/components/app/info-list";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  const [logs, settings] = await Promise.all([
    listAuditLogs(15),
    getBusinessSettings(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title="Configuración" subtitle="Estado del sistema y auditoría" />

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-brand" /> Estado del backend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-3">
            <span className="text-sm text-foreground">Supabase</span>
            {configured ? (
              <Badge tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Configurado
              </Badge>
            ) : (
              <Badge tone="warning">
                <XCircle className="h-3.5 w-3.5" /> Modo demo
              </Badge>
            )}
          </div>
          {!configured ? (
            <p className="text-xs text-muted">
              El sistema usa datos de demostración en memoria. Configura las
              variables <code className="text-brand">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="text-brand">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para
              conectar la base de datos real.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Business config */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-brand" /> Negocio
          </CardTitle>
          <Link
            href="/app/settings/business"
            className="text-xs font-medium text-brand hover:underline"
          >
            Editar
          </Link>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              { label: "Nombre", value: settings.business_name },
              { label: "Propietario", value: settings.owner_name ?? "—" },
              { label: "Ciudad", value: settings.city ?? "—" },
              { label: "WhatsApp", value: settings.whatsapp ? `+${settings.whatsapp}` : `+${businessWhatsapp()}` },
            ]}
          />
          <p className="mt-2 text-xs text-muted">
            Estos datos se usan en el acta PDF. Edítalos en{" "}
            <Link href="/app/settings/business" className="text-brand hover:underline">
              Configuración del negocio
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" /> Auditoría reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted">Sin acciones registradas aún.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {humanize(log.action)} · {humanize(log.entity_type)}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {log.actor_label ?? "Sistema"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {format(parseISO(log.created_at), "dd MMM HH:mm", { locale: es })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
