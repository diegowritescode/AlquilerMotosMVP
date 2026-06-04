import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MORE_NAV } from "@/lib/nav";
import { PageHeader } from "@/components/app/page-header";
import { businessWhatsappLink } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/app/whatsapp-button";

export const metadata = { title: "Más" };

export default function MorePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Más opciones" />

      <div className="space-y-2">
        {MORE_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">¿Necesitas ayuda?</p>
        <p className="mt-1 text-xs text-muted">
          Escríbenos por WhatsApp para soporte del sistema.
        </p>
        <WhatsAppButton
          phone={businessWhatsappLink().replace("https://wa.me/", "")}
          message="Hola, necesito soporte con el sistema de gestión."
          className="mt-3 w-full"
        />
      </div>
    </div>
  );
}
