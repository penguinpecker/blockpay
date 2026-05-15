"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { QrPlaceholder } from "@/components/userapp/qr-placeholder";
import { Chip } from "@/components/userapp/chip";
import { cn } from "@/lib/utils";

const HANDLE = "@alex.bp";
const ADDRESS = "0x8C4f7a3b2D5E1f9aB6c0D7e8F12345aBcDEf01234";

const presets = [10, 25, 50, 100] as const;

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ReceivePage() {
  const [selected, setSelected] = useState<number | "custom">(25);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState<"handle" | "address" | null>(null);

  const handleCopy = (which: "handle" | "address", value: string) => {
    void value;
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-5"
    >
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Receive <span className="text-accent">USDC</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Scan the QR or share your handle to get paid.
        </p>
      </header>

      <div className="card-frame flex flex-col items-center gap-5 px-5 py-6">
        <QrPlaceholder size={12} className="max-w-[240px]" label="Pay alex.bp" />

        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={() => handleCopy("handle", HANDLE)}
            className="flex w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-left transition-colors hover:border-[rgba(74,222,128,0.35)]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Handle
              </span>
              <span className="text-sm font-semibold text-white">
                {HANDLE}
              </span>
            </div>
            {copied === "handle" ? (
              <Check size={16} strokeWidth={2.4} className="text-[#4ade80]" />
            ) : (
              <Copy size={16} strokeWidth={2} className="text-zinc-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCopy("address", ADDRESS)}
            className="flex w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-left transition-colors hover:border-[rgba(74,222,128,0.35)]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Wallet address
              </span>
              <span className="font-mono text-sm font-semibold text-white">
                {truncate(ADDRESS)}
              </span>
            </div>
            {copied === "address" ? (
              <Check size={16} strokeWidth={2.4} className="text-[#4ade80]" />
            ) : (
              <Copy size={16} strokeWidth={2} className="text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      <section aria-labelledby="preset-label" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            id="preset-label"
            className="text-xs font-medium uppercase tracking-widest text-zinc-500"
          >
            Request amount
          </span>
          <Chip tone="muted">Optional</Chip>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {presets.map((p) => {
            const active = selected === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelected(p);
                  setCustom("");
                }}
                className={cn(
                  "rounded-full border px-2 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-[rgba(74,222,128,0.55)] bg-[rgba(74,222,128,0.14)] text-[#4ade80]"
                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white hover:border-[rgba(74,222,128,0.35)]",
                )}
              >
                ${p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelected("custom")}
            className={cn(
              "rounded-full border px-2 py-2 text-sm font-semibold transition-colors",
              selected === "custom"
                ? "border-[rgba(74,222,128,0.55)] bg-[rgba(74,222,128,0.14)] text-[#4ade80]"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white hover:border-[rgba(74,222,128,0.35)]",
            )}
          >
            Custom
          </button>
        </div>

        {selected === "custom" ? (
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3 focus-within:border-[rgba(74,222,128,0.45)]">
            <span className="font-display text-xl font-semibold text-zinc-500">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="0.00"
              className="font-display flex-1 bg-transparent text-xl font-semibold text-white outline-none placeholder:text-zinc-700"
            />
            <span className="text-xs font-semibold text-zinc-400">USDC</span>
          </div>
        ) : null}
      </section>
    </form>
  );
}
