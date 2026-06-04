import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const accents: Record<Tone, string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  info: "border-l-info",
  neutral: "border-l-border",
};

/**
 * Compact alert/expiration row with a colored left accent (traffic-light tone),
 * an optional badge, and an optional link target.
 */
export function AlertCard({
  title,
  subtitle,
  badgeLabel,
  tone = "neutral",
  href,
  right,
}: {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  tone?: Tone;
  href?: string;
  right?: React.ReactNode;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border border-l-4 bg-surface px-3.5 py-3 transition-colors",
        accents[tone],
        href && "hover:border-brand/40",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {right}
        {badgeLabel ? <Badge tone={tone}>{badgeLabel}</Badge> : null}
        {href ? <ChevronRight className="h-4 w-4 text-muted" /> : null}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
