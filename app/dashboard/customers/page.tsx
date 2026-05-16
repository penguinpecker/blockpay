import { Users } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import {
  formatAmount,
  formatShortDateTime,
  truncateAddress,
} from "@/components/dashboard/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CustomerRow = {
  payer: string;
  payerFull: string;
  paymentCount: number;
  totalAmount: string;
  lastPayment: string;
};

function initials(addr: string) {
  return addr.replace(/^0x/i, "").slice(0, 2).toUpperCase();
}

export default async function CustomersPage() {
  const { merchant } = await requireMerchant("/dashboard/customers");
  const settlementAddressLower = merchant.settlementAddress.toLowerCase();

  const grouped = await prisma.payment.groupBy({
    by: ["payer"],
    where: { merchantAddress: settlementAddressLower },
    _count: { _all: true },
    _max: { blockTimestamp: true },
  });

  // For totals we need a separate aggregation since amount is stored as a
  // string column. Pull amount/payer rows and sum manually.
  const rawRows = await prisma.payment.findMany({
    where: { merchantAddress: settlementAddressLower },
    select: { payer: true, amount: true, blockTimestamp: true },
  });

  const totalsByPayer = new Map<string, bigint>();
  for (const r of rawRows) {
    try {
      const cur = totalsByPayer.get(r.payer) ?? BigInt(0);
      totalsByPayer.set(r.payer, cur + BigInt(r.amount));
    } catch {
      // skip unparseable
    }
  }

  const currency = merchant.settlementCurrency;

  const rows: CustomerRow[] = grouped
    .map((g) => ({
      payer: truncateAddress(g.payer),
      payerFull: g.payer,
      paymentCount: g._count._all,
      totalAmount: formatAmount(
        (totalsByPayer.get(g.payer) ?? BigInt(0)).toString(),
        currency,
      ),
      lastPayment: g._max.blockTimestamp
        ? formatShortDateTime(g._max.blockTimestamp)
        : "—",
      lastPaymentDate: g._max.blockTimestamp ?? new Date(0),
    }))
    .sort(
      (a, b) => b.lastPaymentDate.getTime() - a.lastPaymentDate.getTime(),
    )
    .map(({ lastPaymentDate: _drop, ...rest }) => {
      void _drop;
      return rest;
    });

  const columns: Column<CustomerRow>[] = [
    {
      key: "name",
      header: "Customer",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(74,222,128,0.12)] font-display text-xs font-bold text-[#4ade80]">
            {initials(r.payerFull)}
          </div>
          <span className="font-mono text-xs text-white">{r.payer}</span>
        </div>
      ),
    },
    {
      key: "count",
      header: "Payments",
      align: "right",
      render: (r) => (
        <span className="font-medium text-white">{r.paymentCount}</span>
      ),
    },
    {
      key: "total",
      header: "Total volume",
      align: "right",
      render: (r) => (
        <span className="font-medium text-white">{r.totalAmount}</span>
      ),
    },
    {
      key: "lastPayment",
      header: "Last payment",
      align: "right",
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-zinc-400">
          {r.lastPayment}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone who has ever paid through your account. Sorted by most recent activity."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          body="Once a wallet pays one of your invoices or payment links, it shows up here with lifetime totals and last-seen activity."
          cta={{
            label: "Create an invoice",
            href: "/dashboard/invoices?new=1",
          }}
        />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.payerFull} />
      )}
    </div>
  );
}
