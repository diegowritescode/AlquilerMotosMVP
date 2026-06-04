import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInCalendarDays,
  differenceInYears,
  format,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format COP money. COP has no cents in practice. */
export function formatCOP(value: number | null | undefined): string {
  const n = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Compact COP for tight stat cards, e.g. $1.5M. */
export function formatCOPCompact(value: number | null | undefined): string {
  const n = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `$${Math.round(n / 1_000)}K`;
  }
  return `$${n}`;
}

/** Today as yyyy-MM-dd in local time. */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Safe ISO date parser that tolerates null/undefined. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

/** Human date in Spanish, e.g. "20 may 2024". */
export function formatDate(value?: string | null): string {
  const d = parseDate(value);
  if (!d) return "—";
  return format(d, "dd MMM yyyy", { locale: es });
}

/** Long human date, e.g. "lunes, 20 de mayo de 2024". */
export function formatDateLong(value?: string | null): string {
  const d = parseDate(value);
  if (!d) return "—";
  return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

/** Whole days from today to the given date (negative => past). */
export function daysUntil(value?: string | null): number | null {
  const d = parseDate(value);
  if (!d) return null;
  return differenceInCalendarDays(d, new Date());
}

/** Age in years from birth date. */
export function calcAge(birthDate?: string | null): number | null {
  const d = parseDate(birthDate);
  if (!d) return null;
  return differenceInYears(new Date(), d);
}

/** "Faltan 5 días" / "Vencido hace 3 días" / "Vence hoy". */
export function relativeExpiry(value?: string | null): string {
  const days = daysUntil(value);
  if (days === null) return "Sin fecha";
  if (days === 0) return "Vence hoy";
  if (days > 0) return `Faltan ${days} ${days === 1 ? "día" : "días"}`;
  const past = Math.abs(days);
  return `Vencido hace ${past} ${past === 1 ? "día" : "días"}`;
}

export type Tone = "success" | "warning" | "danger" | "neutral" | "info";

/** Map "days left" to a traffic-light tone (whitepaper §7). */
export function expiryTone(value?: string | null): Tone {
  const days = daysUntil(value);
  if (days === null) return "neutral";
  if (days < 0) return "danger";
  if (days <= 7) return "warning";
  return "success";
}

/** Title-case a Spanish enum-ish slug, e.g. "cambio_aceite" -> "Cambio aceite". */
export function humanize(value?: string | null): string {
  if (!value) return "—";
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lightweight UUID v4 generator (works in node & browser without deps). */
export function uuid(): string {
  // Prefer the platform crypto when available.
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
