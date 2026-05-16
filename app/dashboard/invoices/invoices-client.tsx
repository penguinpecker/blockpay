"use client";

import { useState } from "react";
import { Plus, X, ChevronRight, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import {
  StatusPill,
  type StatusVariant,
} from "@/components/dashboard/status-pill";

export type InvoiceRow = {
  id: string;
  number: string;
  customer: string;
  amount: string;
  status: "draft" | "open" | "paid" | "expired" | "void";
  chain: string;
  due: string;
  createdAt: string;
};

type Props = {
  merchantId: string;
  merchantAddress: string;
  defaultChainKey: string;
  defaultCurrency: string;
  initialOpen: boolean;
  initialRows: InvoiceRow[];
};

function statusVariant(s: InvoiceRow["status"]): {
  variant: StatusVariant;
  label: string;
} {
  switch (s) {
    case "paid":
      return { variant: "success", label: "Paid" };
    case "open":
      return { variant: "pending", label: "Open" };
    case "expired":
      return { variant: "failed", label: "Expired" };
    case "void":
      return { variant: "refunded", label: "Void" };
    case "draft":
      return { variant: "pending", label: "Draft" };
  }
}

const columns: Column<InvoiceRow>[] = [
  {
    key: "number",
    header: "ID",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-300">{r.number}</span>
    ),
  },
  {
    key: "customer",
    header: "Merchant address",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-200">{r.customer}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (r) => <span className="font-medium text-white">{r.amount}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => {
      const s = statusVariant(r.status);
      return <StatusPill variant={s.variant} label={s.label} />;
    },
  },
  {
    key: "chain",
    header: "Chain",
    render: (r) => <span className="text-zinc-300">{r.chain}</span>,
  },
  {
    key: "created",
    header: "Created",
    align: "right",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-zinc-400">
        {r.createdAt}
      </span>
    ),
  },
];

export function InvoicesClient({
  merchantId,
  merchantAddress,
  defaultChainKey,
  defaultCurrency,
  initialOpen,
  initialRows,
}: Props) {
  const [creating, setCreating] = useState(initialOpen);
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows);

  const [amountHuman, setAmountHuman] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [chainKey, setChainKey] = useState(defaultChainKey);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = amountHuman.trim();
    if (!trimmed || Number.isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      setErrorMsg("Enter a valid amount greater than zero.");
      return;
    }

    // USDC / EURC are 6-decimal tokens; convert human-readable to base units.
    const [whole, frac = ""] = trimmed.split(".");
    const fracPadded = (frac + "000000").slice(0, 6);
    const baseUnits = `${BigInt(whole || "0") * BigInt(1_000_000) + BigInt(fracPadded || "0")}`;

    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          merchantAddress,
          amount: baseUnits,
          currency,
          chainKey,
          lineItems: [
            {
              label: memo.trim() || "Invoice",
              amount: `${trimmed} ${currency}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(j.error ?? `Request failed (${res.status})`);
        return;
      }

      const data = (await res.json()) as {
        id: string;
        invoice: {
          id: string;
          merchantAddress: string;
          amount: string;
          currency: string;
          chainKey: string;
          createdAt: number;
        };
      };

      const created = data.invoice;
      const newRow: InvoiceRow = {
        id: created.id,
        number: created.id.slice(0, 12),
        customer: `${created.merchantAddress.slice(0, 6)}...${created.merchantAddress.slice(-4)}`,
        amount: formatHuman(created.amount, created.currency),
        status: "open",
        chain: created.chainKey,
        due: "—",
        createdAt: new Date(created.createdAt).toUTCString().slice(5, 16),
      };
      setRows((prev) => [newRow, ...prev]);
      setAmountHuman("");
      setMemo("");
      setCreating(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
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
              Create invoice
              <ChevronRight size={16} strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      {creating ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6"
        >
          <div className="font-display text-lg font-semibold text-white">
            New invoice
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            We mint an on-chain invoice id and return a shareable checkout URL.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={`Amount (${currency})`}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountHuman}
                onChange={(e) => setAmountHuman(e.target.value)}
                placeholder="0.00"
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
            <Field label="Memo (optional)">
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Q2 retainer"
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
              onClick={() => setCreating(false)}
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
                  Create invoice
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
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      ) : null}
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

function formatHuman(amountBaseUnits: string, currency: string): string {
  const symbol = currency === "EURC" ? "€" : "$";
  try {
    const value = BigInt(amountBaseUnits);
    const whole = value / BigInt(1_000_000);
    const rem = value % BigInt(1_000_000);
    const cents = Number(rem / BigInt(10_000));
    return `${symbol}${whole.toString()}.${cents.toString().padStart(2, "0")}`;
  } catch {
    return `${symbol}${amountBaseUnits}`;
  }
}
