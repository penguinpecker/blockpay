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

function TokenDot({ token }: { token: TokenId }) {
  return (
    <svg
      width="18"
      height="18"
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
    <label className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors focus-within:border-[rgba(74,222,128,0.4)] hover:border-white/20">
      <TokenDot token={value} />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          Pay with
        </div>
        <div className="font-display text-sm font-semibold text-white">
          {value}
        </div>
      </div>
      <ChevronDown
        size={16}
        className="text-zinc-500 transition-colors group-hover:text-white"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TokenId)}
        className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
        aria-label="Select payment token"
      >
        {TOKENS.map((t) => (
          <option key={t} value={t} className="bg-[#0c1310] text-white">
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
