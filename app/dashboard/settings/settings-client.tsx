"use client";

import { useState } from "react";
import { ChevronRight, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Profile", "Settlement", "Brand", "Tax", "Webhooks"] as const;
type Tab = (typeof tabs)[number];

type Initial = {
  businessName: string;
  email: string;
  walletAddress: string;
  settlementAddress: string;
  settlementChainKey: string;
  settlementCurrency: string;
  webhookUrl: string;
};

export function SettingsClient({ initial }: { initial: Initial }) {
  const [active, setActive] = useState<Tab>("Profile");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0a0f0c] p-1.5 w-fit">
        {tabs.map((t) => {
          const isActive = active === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-[rgba(74,222,128,0.14)] text-[#4ade80]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {active === "Profile" || active === "Settlement" ? (
        <ProfileForm initial={initial} focus={active} />
      ) : (
        <ComingSoon name={active} />
      )}
    </div>
  );
}

function ProfileForm({
  initial,
  focus,
}: {
  initial: Initial;
  focus: "Profile" | "Settlement";
}) {
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [settlementAddress, setSettlementAddress] = useState(
    initial.settlementAddress,
  );
  const [settlementChainKey, setSettlementChainKey] = useState(
    initial.settlementChainKey,
  );
  const [settlementCurrency, setSettlementCurrency] = useState(
    initial.settlementCurrency,
  );

  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          email: initial.email || undefined,
          settlementAddress,
          settlementChainKey,
          settlementCurrency,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? `Request failed (${res.status})`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7"
    >
      <div>
        <div className="font-display text-lg font-semibold text-white">
          {focus === "Profile" ? "Account profile" : "Settlement"}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {focus === "Profile"
            ? "Your business identity and login email."
            : "Where funds settle and in what currency."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business name">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="dashboard-settings-input"
            required
          />
        </Field>
        <Field label="Account email">
          <input
            type="email"
            value={initial.email}
            readOnly
            className="dashboard-settings-input opacity-70"
          />
        </Field>
        {initial.walletAddress ? (
          <Field label="Wallet address (sign-in)">
            <input
              type="text"
              value={initial.walletAddress}
              readOnly
              className="dashboard-settings-input font-mono opacity-70"
            />
          </Field>
        ) : null}
        <Field label="Settlement address">
          <input
            type="text"
            value={settlementAddress}
            onChange={(e) => setSettlementAddress(e.target.value)}
            placeholder="0x…"
            className="dashboard-settings-input font-mono"
            required
          />
        </Field>
        <Field label="Settlement chain">
          <select
            value={settlementChainKey}
            onChange={(e) => setSettlementChainKey(e.target.value)}
            className="dashboard-settings-input"
          >
            <option value="arc-testnet">Arc Testnet</option>
            <option value="arc" disabled>
              Arc Mainnet (post-audit)
            </option>
          </select>
        </Field>
        <Field label="Settlement currency">
          <select
            value={settlementCurrency}
            onChange={(e) => setSettlementCurrency(e.target.value)}
            className="dashboard-settings-input"
          >
            <option value="USDC">USDC</option>
            <option value="EURC">EURC</option>
          </select>
        </Field>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-[rgba(74,222,128,0.10)] pt-5">
        <button type="submit" disabled={submitting} className="btn-pill-solid text-sm disabled:opacity-70">
          {submitting ? (
            <>
              <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check size={16} strokeWidth={2.4} /> Saved
            </>
          ) : (
            <>
              Save changes
              <ChevronRight size={16} strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      <style>{`
        .dashboard-settings-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0a0f0c;
          padding: 10px 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 160ms ease;
        }
        .dashboard-settings-input::placeholder { color: #52525b; }
        .dashboard-settings-input:focus { border-color: rgba(74,222,128,0.45); }
      `}</style>
    </form>
  );
}

function ComingSoon({ name }: { name: Tab }) {
  const copy: Record<Exclude<Tab, "Profile" | "Settlement">, string> = {
    Brand: "Custom logo, colors, and merchant page styling are coming with v2.",
    Tax: "Automated VAT / sales-tax handling lands in v2.",
    Webhooks:
      "Manage webhook endpoints from the Integrations page — full delivery logs come with v2.",
  };
  return (
    <div className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7">
      <div className="font-display text-lg font-semibold text-white">{name}</div>
      <p className="mt-1 text-sm text-zinc-500">
        {copy[name as Exclude<Tab, "Profile" | "Settlement">]}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
