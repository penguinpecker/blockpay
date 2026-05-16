import { Inbox, Copy, ExternalLink } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import {
  chainName,
  divideBigInts,
  formatAmount,
  formatShortDateTime,
  sumAmounts,
  truncateAddress,
  truncateHash,
} from "@/components/dashboard/format";
import { prisma } from "@/lib/prisma";

type RecentRow = {
  id: string;
  payer: string;
  amount: string;
  currency: string;
  chain: string;
  txHash: string;
  txHashFull: string;
  date: string;
};

const recentColumns: Column<RecentRow>[] = [
  {
    key: "id",
    header: "Payment",
    render: (r) => (
      <span className="font-mono text-xs text-[var(--fg-subtle)]">{r.id}</span>
    ),
  },
  {
    key: "payer",
    header: "Customer",
    render: (r) => (
      <span className="font-mono text-xs text-[var(--fg)]">{r.payer}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (r) => (
      <span className="font-medium text-[var(--fg)] tnum">{r.amount}</span>
    ),
  },
  {
    key: "chain",
    header: "Chain",
    render: (r) => <span className="text-[var(--fg-muted)]">{r.chain}</span>,
  },
  {
    key: "tx",
    header: "Tx",
    render: (r) => (
      <div className="relative inline-flex items-center gap-2">
        <span className="font-mono text-xs text-[var(--fg-subtle)]">
          {r.txHash}
        </span>
        <span className="-translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 inline-flex items-center gap-1">
          <button
            type="button"
            aria-label="Copy tx hash"
            className="grid h-6 w-6 place-items-center rounded-md border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] hover:border-[var(--border-strong)]"
          >
            <Copy size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="View on explorer"
            className="grid h-6 w-6 place-items-center rounded-md border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] hover:border-[var(--border-strong)]"
          >
            <ExternalLink size={12} strokeWidth={1.8} />
          </button>
        </span>
      </div>
    ),
  },
  {
    key: "date",
    header: "Date",
    align: "right",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-[var(--fg-subtle)] tnum">
        {r.date}
      </span>
    ),
  },
];

/**
 * Build a 14-point sparkline from a single aggregate total. We split the
 * total into 14 equal increments so the line slopes upward from 0 to total
 * — purely a visual cue, no fabricated micro-data.
 */
function sparklineFromTotal(totalBase: bigint): number[] {
  if (totalBase <= BigInt(0)) return [];
  const total = Number(totalBase);
  const n = 14;
  const out: number[] = [];
  for (let i = 1; i <= n; i++) {
    out.push((total / n) * i);
  }
  return out;
}

function sparklineFromCount(count: number): number[] {
  if (count <= 0) return [];
  const n = 14;
  const out: number[] = [];
  for (let i = 1; i <= n; i++) {
    out.push((count / n) * i);
  }
  return out;
}

export default async function OverviewPage() {
  const { merchant } = await requireMerchant("/dashboard");

  const settlementAddressLower = merchant.settlementAddress.toLowerCase();

  // All payments to this merchant's settlement address.
  const allPayments = await prisma.payment.findMany({
    where: { merchantAddress: settlementAddressLower },
    orderBy: { blockTimestamp: "desc" },
  });

  const totalBase = sumAmounts(allPayments.map((p) => p.amount));
  const count = allPayments.length;
  const avgBase =
    count > 0 ? divideBigInts(totalBase, BigInt(count)) : "0";

  const currency = merchant.settlementCurrency;
  const totalDisplay = formatAmount(totalBase.toString(), currency);
  const avgDisplay = formatAmount(avgBase, currency);

  // Group by chainKey for the rail breakdown.
  const byChain = new Map<string, bigint>();
  for (const p of allPayments) {
    try {
      const cur = byChain.get(p.chainKey) ?? BigInt(0);
      byChain.set(p.chainKey, cur + BigInt(p.amount));
    } catch {
      // skip
    }
  }
  const chainEntries = Array.from(byChain.entries())
    .map(([key, base]) => ({ key, base }))
    .sort((a, b) => (b.base > a.base ? 1 : b.base < a.base ? -1 : 0));

  // Aurora chart palette — defined in .palette-aurora as --chart-1..--chart-4.
  const chainPalette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];
  const chains = chainEntries.map((c, i) => {
    const pct =
      totalBase > BigInt(0)
        ? Number((c.base * BigInt(10000)) / totalBase) / 100
        : 0;
    return {
      key: c.key,
      name: chainName(c.key),
      pct,
      base: c.base,
      color: chainPalette[i % chainPalette.length],
      display: formatAmount(c.base.toString(), currency),
    };
  });

  const recentRows: RecentRow[] = allPayments.slice(0, 5).map((p) => ({
    id: p.id.slice(0, 10),
    payer: truncateAddress(p.payer),
    amount: formatAmount(p.amount, currency),
    currency,
    chain: chainName(p.chainKey),
    txHash: truncateHash(p.txHash),
    txHashFull: p.txHash,
    date: formatShortDateTime(p.blockTimestamp),
  }));

  const volumeSpark = sparklineFromTotal(totalBase);
  const countSpark = sparklineFromCount(count);
  const avgSpark =
    count > 0 ? sparklineFromTotal(BigInt(avgBase)) : [];

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total volume"
          value={totalDisplay}
          delta={count > 0 ? `${count} payments` : undefined}
          trend={count > 0 ? "up" : "flat"}
          sparkline={volumeSpark}
          sparklineColor="var(--chart-1)"
          hint={
            count > 0
              ? `Across ${chainEntries.length} ${
                  chainEntries.length === 1 ? "chain" : "chains"
                }`
              : undefined
          }
        />
        <StatCard
          label="Successful payments"
          value={count.toLocaleString()}
          delta={count > 0 ? "Confirmed on-chain" : undefined}
          trend={count > 0 ? "up" : "flat"}
          sparkline={countSpark}
          sparklineColor="var(--chart-2)"
        />
        <StatCard
          label="Avg ticket"
          value={count > 0 ? avgDisplay : formatAmount("0", currency)}
          delta={count > 0 ? "Per payment" : undefined}
          trend="flat"
          sparkline={avgSpark}
          sparklineColor="var(--chart-3)"
        />
        <StatCard
          label="Pending payout"
          value={formatAmount("0", currency)}
          delta="Instant settlement"
          trend="flat"
          hint="Settled directly to your wallet"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)]">
                Volume to date
              </div>
              <div className="mt-2 font-display text-2xl font-medium text-[var(--fg)] tnum">
                {totalDisplay}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--fg-subtle)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                Settled {currency}
              </span>
            </div>
          </div>
          <div className="mt-10 flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/30 text-center">
            <p className="px-6 text-sm text-[var(--fg-subtle)]">
              Volume builds here as payments arrive.
            </p>
          </div>
        </div>

        {chains.length > 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)]">
              Settlement chains
            </div>
            <div className="mt-1 text-[11px] text-[var(--fg-subtle)]">
              By share of volume
            </div>

            <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elev)]">
              {chains.map((ch) => (
                <div
                  key={ch.key}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${ch.pct}%`,
                    backgroundColor: ch.color,
                  }}
                  aria-label={`${ch.name} ${ch.pct.toFixed(1)}%`}
                />
              ))}
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {chains.map((ch) => (
                <li
                  key={ch.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="inline-flex items-center gap-2.5 text-[var(--fg-muted)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ch.color }}
                    />
                    {ch.name}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[var(--fg-subtle)] tnum">
                      {ch.pct.toFixed(1)}%
                    </span>
                    <span className="font-display text-xs font-medium text-[var(--fg)] tnum">
                      {ch.display}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)]">
              Settlement chains
            </div>
            <div className="mt-6 text-sm text-[var(--fg-subtle)]">
              Once a payment lands, you will see which chain it settled on
              here.
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-medium text-[var(--fg)]">
              Recent payments
            </h3>
            <p className="mt-1 text-sm text-[var(--fg-subtle)]">
              Last 5 settled transactions on your account.
            </p>
          </div>
        </div>
        {recentRows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No payments yet"
            body="Share your first checkout link to start receiving USDC."
            cta={{ label: "Create an invoice", href: "/dashboard/invoices" }}
          />
        ) : (
          <DataTable
            columns={recentColumns}
            rows={recentRows}
            rowKey={(r) => r.id}
          />
        )}
      </section>
    </div>
  );
}
