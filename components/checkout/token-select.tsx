"use client";

import { ChevronDown } from "lucide-react";

export type TokenId = "USDC" | "USDT" | "ETH" | "SOL";

const TOKEN_COLORS: Record<TokenId, string> = {
  USDC: "#2775ca",
  USDT: "#26a17b",
  ETH: "#a1a1aa",
  SOL: "#a855f7",
};

const TOKENS: TokenId[] = ["USDC", "USDT", "ETH", "SOL"];

export function TokenDot({ token, size = 18 }: { token: TokenId; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="9" fill={TOKEN_COLORS[token]} />
      <text
        x="9"
        y="11.5"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="system-ui"
      >
        {token}
      </text>
    </svg>
  );
}

export function TokenSelect({
  value,
  onChange,
}: {
  value: TokenId;
  onChange: (next: TokenId) => void;
}) {
  return (
    <label className="group relative flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/[0.02] px-4 py-3 transition-colors focus-within:border-[var(--border-active)] hover:border-[var(--border-strong)]">
      <TokenDot token={value} />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)]">
          Pay with
        </div>
        <div className="font-display text-sm font-semibold text-[var(--fg)] tnum">
          {value}
        </div>
      </div>
      <ChevronDown
        size={16}
        className="text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--fg)]"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TokenId)}
        className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
        aria-label="Select payment token"
      >
        {TOKENS.map((t) => (
          <option key={t} value={t} className="bg-[var(--bg-card)] text-[var(--fg)]">
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
