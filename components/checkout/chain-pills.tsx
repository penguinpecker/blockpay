"use client";

import { cn } from "@/lib/utils";

export type ChainId = "arc" | "base" | "ethereum" | "solana";

export const CHAINS: { id: ChainId; label: string; dot: string }[] = [
  { id: "arc", label: "Arc", dot: "#4ade80" },
  { id: "base", label: "Base", dot: "#3b82f6" },
  { id: "ethereum", label: "Ethereum", dot: "#a1a1aa" },
  { id: "solana", label: "Solana", dot: "#a855f7" },
];

export function ChainPills({
  value,
  onChange,
}: {
  value: ChainId;
  onChange: (next: ChainId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHAINS.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-[var(--border-active)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--fg)]"
                : "border-[var(--border)] bg-white/[0.02] text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
            )}
            aria-pressed={active}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: c.dot }}
              aria-hidden="true"
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
