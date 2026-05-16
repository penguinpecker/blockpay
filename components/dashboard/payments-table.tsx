"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusPill, type StatusVariant } from "@/components/dashboard/status-pill";
import { cn } from "@/lib/utils";

export type PaymentRow = {
  id: string;
  date: string;
  status: StatusVariant;
  customer: string;
  amount: string;
  chain: string;
  tx: string;
};

const filters: { key: "all" | StatusVariant; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Succeeded" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
];

const columns: Column<PaymentRow>[] = [
  {
    key: "date",
    header: "Date",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-zinc-400">{r.date}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusPill variant={r.status} />,
  },
  {
    key: "customer",
    header: "Customer",
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
    key: "chain",
    header: "Chain",
    render: (r) => <span className="text-zinc-300">{r.chain}</span>,
  },
  {
    key: "tx",
    header: "Tx hash",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-400">{r.tx}</span>
    ),
  },
];

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const [filter, setFilter] = useState<"all" | StatusVariant>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !p.customer.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q) &&
          !p.tx.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [filter, query, rows]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-[rgba(74,222,128,0.55)] bg-[rgba(74,222,128,0.12)] text-[#4ade80]"
                    : "border-[rgba(255,255,255,0.08)] bg-transparent text-zinc-400 hover:text-white hover:border-[rgba(255,255,255,0.18)]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative md:w-72">
          <Search
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, tx, id"
            className="w-full rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0c1310] py-2 pl-9 pr-3.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-[rgba(74,222,128,0.45)]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyMessage="No payments match these filters."
      />
    </>
  );
}
