"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike } from "lucide-react";
import { FULL_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <Link
        href="/app/dashboard"
        className="flex items-center gap-2 px-5 py-5 text-foreground"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
          <Bike className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold uppercase leading-tight tracking-wide">
          {businessName}
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {FULL_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
