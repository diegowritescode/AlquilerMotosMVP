import Link from "next/link";
import { Bike } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/constants";

/** Shared chrome for /privacy and /terms placeholder pages. */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-foreground">
              {BUSINESS_NAME}
            </span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← Inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <div className="prose-legal mt-6 space-y-5 text-sm leading-relaxed text-foreground/85">
          {children}
        </div>
        <div className="mt-10 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning">
          <strong>Aviso:</strong> Este es un texto placeholder para el MVP. La
          versión final debe ser revisada y aprobada por un asesor legal antes
          de publicarse.
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-muted">{children}</div>
    </section>
  );
}
