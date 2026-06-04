import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic list row used across all modules (motos, clientes, alquileres…).
 * Left: optional avatar/thumbnail. Middle: title + meta lines. Right: status
 * badge / value + chevron.
 */
export function EntityCard({
  href,
  thumbnail,
  title,
  lines,
  right,
  className,
}: {
  href?: string;
  thumbnail?: React.ReactNode;
  title: string;
  lines?: React.ReactNode[];
  right?: React.ReactNode;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors",
        href && "hover:border-brand/40",
        className,
      )}
    >
      {thumbnail ? <div className="shrink-0">{thumbnail}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {lines?.map((line, i) => (
          <p key={i} className="truncate text-xs text-muted">
            {line}
          </p>
        ))}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        {right}
      </div>
      {href ? <ChevronRight className="h-4 w-4 shrink-0 text-muted" /> : null}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

/** Square brand-tinted thumbnail with an icon — placeholder for moto photos. */
export function IconThumb({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl bg-surface-3 text-brand",
        className,
      )}
    >
      {children}
    </div>
  );
}
