import Link from "next/link";
import { Bike, LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { BottomNavigation } from "./bottom-navigation";
import { BUSINESS_NAME } from "@/lib/constants";
import { logoutAction } from "@/lib/actions/auth";

/**
 * Admin layout: desktop sidebar + sticky mobile top bar + mobile bottom nav.
 * Content is centered and constrained for a comfortable mobile-first reading
 * width while still using the space on desktop.
 */
export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar businessName={BUSINESS_NAME} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur">
          <Link
            href="/app/dashboard"
            className="flex items-center gap-2 md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
              <Bike className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">
              {BUSINESS_NAME}
            </span>
          </Link>
          <div className="hidden text-sm text-muted md:block">
            Panel administrativo
          </div>
          <div className="flex items-center gap-3">
            {userEmail ? (
              <span className="hidden text-xs text-muted sm:inline">
                {userEmail}
              </span>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs text-muted transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
