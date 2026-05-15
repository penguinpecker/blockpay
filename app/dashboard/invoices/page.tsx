"use client";

import { useState } from "react";
import { Plus, X, ChevronRight } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusPill, type StatusVariant } from "@/components/dashboard/status-pill";
import { PageHeader } from "@/components/dashboard/page-header";

type InvoiceStatus = "paid" | "open" | "overdue" | "void";

type Invoice = {
  number: string;
  customer: string;
  amount: string;
  status: InvoiceStatus;
  due: string;
};

const invoices: Invoice[] = [
  {
    number: "INV-001042",
    customer: "Northwave Studios",
    amount: "$1,240.00",
    status: "paid",
    due: "May 10, 2026",
  },
  {
    number: "INV-001041",
    customer: "Parallax Labs",
    amount: "$3,120.00",
    status: "open",
    due: "May 20, 2026",
  },
  {
    number: "INV-001040",
    customer: "Candlebox EU",
    amount: "$560.00",
    status: "open",
    due: "May 22, 2026",
  },
  {
    number: "INV-001039",
    customer: "Bridge42",
    amount: "$2,400.00",
    status: "overdue",
    due: "May 02, 2026",
  },
  {
    number: "INV-001038",
    customer: "Orbit Coffee Co.",
    amount: "$96.00",
    status: "paid",
    due: "Apr 28, 2026",
  },
  {
    number: "INV-001037",
    customer: "Longtail Records",
    amount: "$582.40",
    status: "void",
    due: "Apr 25, 2026",
  },
];

function statusVariant(s: InvoiceStatus): { variant: StatusVariant; label: string } {
  switch (s) {
    case "paid":
      return { variant: "success", label: "Paid" };
    case "open":
      return { variant: "pending", label: "Open" };
    case "overdue":
      return { variant: "failed", label: "Overdue" };
    case "void":
      return { variant: "refunded", label: "Void" };
  }
}

const columns: Column<Invoice>[] = [
  {
    key: "number",
    header: "Number",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-300">{r.number}</span>
    ),
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
    key: "status",
    header: "Status",
    render: (r) => {
      const s = statusVariant(r.status);
      return <StatusPill variant={s.variant} label={s.label} />;
    },
  },
  {
    key: "due",
    header: "Due date",
    align: "right",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-zinc-400">{r.due}</span>
    ),
  },
];

export default function InvoicesPage() {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Send a payable link to any customer, get notified the moment they settle."
        actions={
          <button
            type="button"
            onClick={() => setCreating((c) => !c)}
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
        }
      />

      {creating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCreating(false);
          }}
          className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6"
        >
          <div className="font-display text-lg font-semibold text-white">
            New invoice
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Drafts are saved automatically. Send when ready.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Customer email">
              <input
                type="email"
                placeholder="customer@example.com"
                className="dashboard-input"
              />
            </Field>
            <Field label="Customer name">
              <input
                type="text"
                placeholder="Acme Co."
                className="dashboard-input"
              />
            </Field>
            <Field label="Amount (USDC)">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="dashboard-input"
              />
            </Field>
            <Field label="Due date">
              <input type="date" className="dashboard-input" />
            </Field>
            <Field label="Settlement chain">
              <select className="dashboard-input">
                <option>Base</option>
                <option>Solana</option>
                <option>Polygon</option>
                <option>Arbitrum</option>
              </select>
            </Field>
            <Field label="Memo (optional)">
              <input
                type="text"
                placeholder="Q2 retainer"
                className="dashboard-input"
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-5 py-2 text-sm text-zinc-300 transition-colors hover:text-white hover:border-[rgba(255,255,255,0.2)]"
            >
              Cancel
            </button>
            <button type="submit" className="btn-pill-solid text-sm">
              Send invoice
              <ChevronRight size={16} strokeWidth={2.4} />
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

      <DataTable columns={columns} rows={invoices} rowKey={(r) => r.number} />
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
