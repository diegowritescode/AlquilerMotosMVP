"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/utils";

type Result = { ok?: boolean; error?: string };

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  neutral: "bg-surface-3 text-muted border-border",
};

/**
 * Compact badge-styled <select> that saves the chosen status IMMEDIATELY via a
 * bound server action (no form, no full edit). Optimistic, with a pending
 * spinner and a brief success check. Safe inside a linked `AlertCard`: pointer
 * events stop propagation so picking a status never triggers the card's link.
 */
export function QuickStatusSelect({
  value,
  options,
  tones,
  action,
  ariaLabel = "Cambiar estado",
}: {
  value: string;
  options: { value: string; label: string }[];
  tones: Record<string, Tone>;
  action: (status: string) => Promise<Result>;
  ariaLabel?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tone: Tone = tones[current] ?? "neutral";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const next = e.target.value;
    const prev = current;
    setCurrent(next); // optimistic
    setError(null);
    setDone(false);
    startTransition(async () => {
      const res = await action(next);
      if (res?.error) {
        setCurrent(prev); // revert
        setError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    });
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <span className="relative inline-flex items-center" onClick={stop} onMouseDown={stop}>
      <select
        aria-label={ariaLabel}
        value={current}
        disabled={pending}
        onChange={onChange}
        onClick={stop}
        onMouseDown={stop}
        title={error ?? undefined}
        className={cn(
          "appearance-none rounded-full border py-0.5 pl-2.5 pr-6 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60",
          error ? "border-danger/50 bg-danger/10 text-danger" : toneClasses[tone],
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 flex items-center">
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : done ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </span>
  );
}
