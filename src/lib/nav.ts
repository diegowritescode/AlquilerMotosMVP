import {
  AlertTriangle,
  Bike,
  CalendarClock,
  FileText,
  Home,
  type LucideIcon,
  MoreHorizontal,
  Receipt,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Bottom navigation (mobile) — 5 primary tabs per whitepaper §12.1. */
export const BOTTOM_NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Inicio", icon: Home },
  { href: "/app/motorcycles", label: "Motos", icon: Bike },
  { href: "/app/rentals", label: "Alquileres", icon: FileText },
  { href: "/app/expirations", label: "Vencimientos", icon: CalendarClock },
  { href: "/app/more", label: "Más", icon: MoreHorizontal },
];

/** Full navigation used by the desktop sidebar and the "Más" page. */
export const FULL_NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: Home },
  { href: "/app/motorcycles", label: "Motos", icon: Bike },
  { href: "/app/customers", label: "Arrendatarios", icon: Users },
  { href: "/app/rentals", label: "Alquileres", icon: FileText },
  { href: "/app/payments", label: "Pagos", icon: Receipt },
  { href: "/app/expirations", label: "Vencimientos", icon: CalendarClock },
  { href: "/app/maintenance", label: "Mantenimientos", icon: Wrench },
  { href: "/app/fines", label: "Fotomultas", icon: AlertTriangle },
  { href: "/app/reports", label: "Reportes", icon: FileText },
  { href: "/app/settings", label: "Configuración", icon: Settings },
];

/** Items shown on the "Más" screen (everything not in the bottom bar). */
export const MORE_NAV: NavItem[] = [
  { href: "/app/customers", label: "Arrendatarios", icon: Users },
  { href: "/app/payments", label: "Pagos", icon: Receipt },
  { href: "/app/maintenance", label: "Mantenimientos", icon: Wrench },
  { href: "/app/fines", label: "Fotomultas", icon: AlertTriangle },
  { href: "/app/reports", label: "Reportes", icon: FileText },
  { href: "/app/settings", label: "Configuración", icon: Settings },
];
