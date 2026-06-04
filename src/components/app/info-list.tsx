import { cn } from "@/lib/utils";

/** Key-value list for detail pages. */
export function InfoList({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((it, i) => (
        <div key={i} className="flex items-start justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted">{it.label}</dt>
          <dd className="text-right text-sm font-medium text-foreground">
            {it.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
