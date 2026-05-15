"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusPill, type StatusVariant } from "@/components/dashboard/status-pill";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

type Payment = {
  id: string;
  date: string;
  status: StatusVariant;
  customer: string;
  amount: string;
  chain: string;
  tx: string;
};

const payments: Payment[] = [
  {
    id: "pmt_3kJ29x",
    date: "May 15, 09:42",
    status: "success",
    customer: "lena@northwave.io",
    amount: "$129.00",
    chain: "Base",
    tx: "0x8f4b29c3e1a784c5b29d6e1a7c8d4f59ab23e1c7",
  },
  {
    id: "pmt_3kJ24q",
    date: "May 15, 09:18",
    status: "success",
    customer: "rio.eth",
    amount: "$48.20",
    chain: "Solana",
    tx: "5xC9aHzPq8RnVwL2tYbZ7cQfWmU3jDk1eN6pAvJrM4Hd",
  },
  {
    id: "pmt_3kIzaP",
    date: "May 15, 08:51",
    status: "pending",
    customer: "studios@parallax.xyz",
    amount: "$312.00",
    chain: "Polygon",
    tx: "0xa19f7c4e83b1d2a6f5e0c894b2dac17e8fb43a9c",
  },
  {
    id: "pmt_3kIyvL",
    date: "May 14, 21:09",
    status: "failed",
    customer: "mark@goodmail.com",
    amount: "$24.00",
    chain: "Arbitrum",
    tx: "0x6c2e9b04faa3e85bd91c074fe2a8b1d39c5f7e0b",
  },
  {
    id: "pmt_3kIuhB",
    date: "May 14, 17:34",
    status: "refunded",
    customer: "ana@northwave.io",
    amount: "$96.00",
    chain: "Base",
    tx: "0xfbd1287a04c9e36c5b88f0e15a7d4291ebc06f3a",
  },
  {
    id: "pmt_3kItpC",
    date: "May 14, 14:02",
    status: "success",
    customer: "vendor@longtail.co",
    amount: "$582.40",
    chain: "Base",
    tx: "0x2e9a7b13fd60c485a912e7c30db4f1a8c63d05ef",
  },
  {
    id: "pmt_3kImzR",
    date: "May 14, 11:47",
    status: "success",
    customer: "8sR4...kPwQ",
    amount: "$18.00",
    chain: "Solana",
    tx: "3qE7tNzCnLp4VgY8jHb5sR2dXmKuW9iA1fJoP6Mc",
  },
  {
    id: "pmt_3kIkfA",
    date: "May 14, 09:21",
    status: "success",
    customer: "support@candlebox.eu",
    amount: "$240.00",
    chain: "Polygon",
    tx: "0xd5a8c0fe2937be64a17c3902bd45f8e1d7c20b6f",
  },
  {
    id: "pmt_3kIgwV",
    date: "May 13, 22:18",
    status: "pending",
    customer: "rinka.sol",
    amount: "$74.20",
    chain: "Solana",
    tx: "7mK2pQrZtY8VnXbL5cFh4gJsW1eA3iD9oU6yPvNc",
  },
  {
    id: "pmt_3kIfaM",
    date: "May 13, 18:55",
    status: "failed",
    customer: "ops@bridge42.io",
    amount: "$1,204.00",
    chain: "Arbitrum",
    tx: "0xc02e1b7d986a45f3e8b1c204fdaeb9572c34091a",
  },
  {
    id: "pmt_3kIcrL",
    date: "May 13, 14:08",
    status: "success",
    customer: "alex.eth",
    amount: "$36.00",
    chain: "Base",
    tx: "0x9f3a7e0c12b48d56e07a39c81bf45e2a6cd1709b",
  },
  {
    id: "pmt_3kIbqK",
    date: "May 13, 10:42",
    status: "refunded",
    customer: "billing@orbitcoffee.shop",
    amount: "$56.40",
    chain: "Polygon",
    tx: "0x47b9d20fae618c5739e2b0c8af1d63ec907a4815",
  },
];

const filters: { key: "all" | StatusVariant; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Succeeded" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
];

function truncateHash(hash: string) {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 7)}...${hash.slice(-5)}`;
}

const columns: Column<Payment>[] = [
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
    render: (r) => <span className="text-zinc-200">{r.customer}</span>,
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
      <span className="font-mono text-xs text-zinc-400">
        {truncateHash(r.tx)}
      </span>
    ),
  },
];

export default function PaymentsPage() {
  const [filter, setFilter] = useState<"all" | StatusVariant>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return payments.filter((p) => {
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
  }, [filter, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Every successful, pending, failed, and refunded payment across your chains."
      />

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
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage="No payments match these filters."
      />
    </div>
  );
}
