"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Horizontal, scrollable status filter chips driven by a URL param.
 */
export function FilterTabs({
  options,
  paramName = "status",
  defaultValue = "todos",
}: {
  options: { value: string; label: string }[];
  paramName?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? defaultValue;

  const select = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === defaultValue) params.delete(paramName);
    else params.set(paramName, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {options.map((opt) => {
        const activeTab = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              activeTab
                ? "border-brand bg-brand/15 font-medium text-brand"
                : "border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
