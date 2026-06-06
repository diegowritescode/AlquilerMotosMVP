"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { List, MapPin, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, Input } from "@/components/ui/form";

interface Option {
  id: string;
  label: string;
}

/**
 * View toggle (Lista / Mapa) + filters (moto, arrendatario, rango de fechas).
 * All state lives in the URL so the server page filters BOTH the list and the
 * map consistently.
 */
export function FinesControls({
  motos,
  customers,
}: {
  motos: Option[];
  customers: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawView = params.get("view");
  const view = rawView === "mapa" || rawView === "camaras" ? rawView : "lista";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="inline-flex rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setParam("view", "")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            view === "lista" ? "bg-brand/15 font-medium text-brand" : "text-muted",
          )}
        >
          <List className="h-4 w-4" /> Lista
        </button>
        <button
          type="button"
          onClick={() => setParam("view", "mapa")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            view === "mapa" ? "bg-brand/15 font-medium text-brand" : "text-muted",
          )}
        >
          <MapPin className="h-4 w-4" /> Mapa
        </button>
        <button
          type="button"
          onClick={() => setParam("view", "camaras")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            view === "camaras" ? "bg-brand/15 font-medium text-brand" : "text-muted",
          )}
        >
          <Camera className="h-4 w-4" /> Cámaras
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          aria-label="Filtrar por moto"
          value={params.get("motorcycle") ?? ""}
          onChange={(e) => setParam("motorcycle", e.target.value)}
        >
          <option value="">Todas las motos</option>
          {motos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por arrendatario"
          value={params.get("customer") ?? ""}
          onChange={(e) => setParam("customer", e.target.value)}
        >
          <option value="">Todos los arrendatarios</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Fecha desde"
          type="date"
          value={params.get("from") ?? ""}
          onChange={(e) => setParam("from", e.target.value)}
        />
        <Input
          aria-label="Fecha hasta"
          type="date"
          value={params.get("to") ?? ""}
          onChange={(e) => setParam("to", e.target.value)}
        />
      </div>
    </div>
  );
}
