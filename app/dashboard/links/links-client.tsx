"use client";

import { useState } from "react";
import {
  Copy,
  Archive,
  RotateCcw,
  Check,
  Plus,
  ChevronRight,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

export type LinkRow = {
  id: string;
  slug: string;
  label: string;
  amount: string;
  currency: string;
  chainKey: string;
  description: string | null;
  active: boolean;
  paymentCount: number;
  url: string;
};

type Props = {
  initialRows: LinkRow[];
  initialOpen: boolean;
  defaultChainKey: string;
  defaultCurrency: string;
  origin: string;
};

const CHAIN_LABEL: Record<string, string> = {
  "base-sepolia": "Base Sepolia",
  "arc-testnet": "Arc Testnet",
  base: "Base",
  arc: "Arc",
  ethereum: "Ethereum",
  optimism: "Optimism",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
};

function chainLabel(key: string): string {
  return CHAIN_LABEL[key] ?? key;
}

function formatHuman(baseUnits: string, currency: string): string {
  const symbol = currency === "EURC" ? "€" : "$";
  try {
    const value = BigInt(baseUnits);
    const whole = value / BigInt(1_000_000);
    const rem = value % BigInt(1_000_000);
    const cents = Number(rem / BigInt(10_000));
    const wholeStr = whole
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${symbol}${wholeStr}.${cents.toString().padStart(2, "0")}`;
  } catch {
    return `${symbol}${baseUnits}`;
  }
}

export function LinksClient({
  initialRows,
  initialOpen,
  defaultChainKey,
  defaultCurrency,
  origin,
}: Props) {
  const [rows, setRows] = useState<LinkRow[]>(initialRows);
  const [creating, setCreating] = useState(initialOpen);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // form state
  const [label, setLabel] = useState("");
  const [amountHuman, setAmountHuman] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [chainKey, setChainKey] = useState(defaultChainKey);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setAmountHuman("");
    setDescription("");
    setErrorMsg(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmedLabel = label.trim();
    const trimmedAmount = amountHuman.trim();
    if (!trimmedLabel) {
      setErrorMsg("Label is required.");
      return;
    }
    if (!trimmedAmount || Number(trimmedAmount) <= 0) {
      setErrorMsg("Enter a valid amount.");
      return;
    }

    // human-readable -> 6-decimal base units
    const [whole, frac = ""] = trimmedAmount.split(".");
    const fracPadded = (frac + "000000").slice(0, 6);
    const baseUnits = (
      BigInt(whole || "0") * BigInt(1_000_000) +
      BigInt(fracPadded || "0")
    ).toString();

    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: trimmedLabel,
          amount: baseUnits,
          currency,
          chainKey,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(j.error ?? `Request failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as { link: LinkRow & { slug: string } };
      const newRow: LinkRow = {
        id: data.link.id,
        slug: data.link.slug,
        label: data.link.label,
        amount: data.link.amount,
        currency: data.link.currency,
        chainKey: data.link.chainKey,
        description: data.link.description ?? null,
        active: true,
        paymentCount: 0,
        url: `${origin}/pay/${data.link.slug}`,
      };
      setRows((prev) => [newRow, ...prev]);
      resetForm();
      setCreating(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (row: LinkRow) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(row.url);
      }
    } catch {
      // ignore
    }
    setCopiedId(row.id);
    setTimeout(() => setCopiedId((c) => (c === row.id ? null : c)), 1600);
  };

  const handleToggleActive = async (row: LinkRow) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/payment-links/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !row.active }),
      });
      if (!res.ok) return;
      setRows((prev) =>
        prev.map((l) => (l.id === row.id ? { ...l, active: !l.active } : l)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: LinkRow) => {
    if (row.paymentCount > 0) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/payment-links/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setRows((prev) => prev.filter((l) => l.id !== row.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            setCreating((c) => !c);
            setErrorMsg(null);
          }}
          className="btn-pill-solid text-sm"
        >
          {creating ? (
            <>
              <X size={16} strokeWidth={2.4} />
              Close
            </>
          ) : (
            <>
              <Plus size={16} strokeWidth={2.6} />
              New payment link
              <ChevronRight size={16} strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      {creating ? (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6"
        >
          <div className="font-display text-lg font-semibold text-white">
            New payment link
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Share the URL anywhere — we mint a hosted checkout for every visit.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Label">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Annual membership"
                className="dashboard-input"
                required
              />
            </Field>
            <Field label={`Amount (${currency})`}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountHuman}
                onChange={(e) => setAmountHuman(e.target.value)}
                placeholder="49.00"
                className="dashboard-input"
                required
              />
            </Field>
            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="dashboard-input"
              >
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </Field>
            <Field label="Settlement chain">
              <select
                value={chainKey}
                onChange={(e) => setChainKey(e.target.value)}
                className="dashboard-input"
              >
                <option value="base-sepolia">Base Sepolia</option>
                <option value="arc-testnet">Arc Testnet</option>
                <option value="base">Base</option>
                <option value="arc">Arc</option>
                <option value="ethereum">Ethereum</option>
                <option value="optimism">Optimism</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="polygon">Polygon</option>
              </select>
            </Field>
            <Field label="Description (optional)" className="md:col-span-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the customer paying for?"
                className="dashboard-input"
              />
            </Field>
          </div>

          {errorMsg ? (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
              {errorMsg}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                resetForm();
              }}
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-5 py-2 text-sm text-zinc-300 transition-colors hover:text-white hover:border-[rgba(255,255,255,0.2)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-pill-solid text-sm disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create link
                  <ChevronRight size={16} strokeWidth={2.4} />
                </>
              )}
            </button>
          </div>

          <style>{`
            .dashboard-input {
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
            .dashboard-input::placeholder { color: #52525b; }
            .dashboard-input:focus { border-color: rgba(74,222,128,0.45); }
          `}</style>
        </form>
      ) : null}

      {rows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="flex flex-col gap-4 rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-base font-semibold text-white">
                      {row.label}
                    </h3>
                    {!row.active ? (
                      <span className="rounded-full border border-zinc-600/40 bg-zinc-700/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                        Archived
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold text-[#4ade80]">
                    {formatHuman(row.amount, row.currency)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="rounded-full border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)] px-2 py-0.5 text-[#86efac]">
                      {chainLabel(row.chainKey)}
                    </span>
                    <span>{row.currency}</span>
                    {row.paymentCount > 0 ? (
                      <span>
                        {row.paymentCount}{" "}
                        {row.paymentCount === 1 ? "payment" : "payments"}
                      </span>
                    ) : null}
                  </div>
                  {row.description ? (
                    <p className="mt-2 truncate text-xs text-zinc-400">
                      {row.description}
                    </p>
                  ) : null}
                  <div className="mt-3 truncate font-mono text-[11px] text-zinc-500">
                    {row.url}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(74,222,128,0.10)] pt-3">
                <button
                  type="button"
                  onClick={() => handleCopy(row)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(74,222,128,0.45)]"
                >
                  {copiedId === row.id ? (
                    <>
                      <Check size={13} strokeWidth={2.4} className="text-[#4ade80]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} strokeWidth={2} />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(255,255,255,0.18)] disabled:opacity-60"
                >
                  {row.active ? (
                    <>
                      <Archive size={13} strokeWidth={2} />
                      Archive
                    </>
                  ) : (
                    <>
                      <RotateCcw size={13} strokeWidth={2} />
                      Restore
                    </>
                  )}
                </button>
                {row.paymentCount === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={busyId === row.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-300 hover:border-amber-500/30 disabled:opacity-60"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
