import { Banknote } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import {
  chainName,
  formatAmount,
  formatShortDateTime,
  truncateAddress,
} from "@/components/dashboard/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CHAIN_COLORS: Record<string, string> = {
  "arc-testnet": "#86efac",
  arc: "#16a34a",
  ethereum: "#15803d",
  optimism: "#f97316",
  arbitrum: "#3b82f6",
  polygon: "#a855f7",
};

export default async function PayoutsPage() {
  const { merchant } = await requireMerchant("/dashboard/payouts");
  const settlementAddressLower = merchant.settlementAddress.toLowerCase();

  const payments = await prisma.payment.findMany({
    where: { merchantAddress: settlementAddressLower },
    select: {
      chainKey: true,
      amount: true,
      blockTimestamp: true,
    },
  });

  type Bucket = {
    chainKey: string;
    total: bigint;
    count: number;
    latest: Date | null;
  };
  const byChain = new Map<string, Bucket>();
  for (const p of payments) {
    const b = byChain.get(p.chainKey) ?? {
      chainKey: p.chainKey,
      total: BigInt(0),
      count: 0,
      latest: null,
    };
    try {
      b.total += BigInt(p.amount);
    } catch {
      // skip unparseable
    }
    b.count += 1;
    if (!b.latest || p.blockTimestamp > b.latest) {
      b.latest = p.blockTimestamp;
    }
    byChain.set(p.chainKey, b);
  }

  const rows = Array.from(byChain.values()).sort((a, b) =>
    b.total > a.total ? 1 : b.total < a.total ? -1 : 0,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payouts"
        description="BlockPay is non-custodial — payments settle directly to your wallet on the chain the customer paid on."
      />

      <div className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6">
        <div className="text-xs uppercase tracking-wider text-zinc-500">
          Settlement wallet
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-sm text-white">
            {merchant.settlementAddress}
          </span>
          <span className="rounded-full border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)] px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-[#4ade80]">
            {chainName(merchant.settlementChainKey)}
          </span>
          <span className="text-xs text-zinc-500">
            Settling in {merchant.settlementCurrency}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payouts yet"
          body="When customers pay on any supported chain, the funds settle straight to your wallet and the chain totals appear here."
          cta={{
            label: "Create a payment link",
            href: "/dashboard/links?new=1",
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const color = CHAIN_COLORS[row.chainKey] ?? "#4ade80";
            return (
              <article
                key={row.chainKey}
                className="flex flex-col gap-4 rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="font-display text-base font-semibold text-white">
                    {chainName(row.chainKey)}
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-white">
                    {formatAmount(
                      row.total.toString(),
                      merchant.settlementCurrency,
                    )}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {row.count} {row.count === 1 ? "payment" : "payments"}
                    {row.latest ? ` · last ${formatShortDateTime(row.latest)}` : ""}
                  </div>
                </div>
                <div className="border-t border-[rgba(74,222,128,0.10)] pt-3 text-xs text-zinc-500">
                  Settled to{" "}
                  <span className="font-mono text-zinc-300">
                    {truncateAddress(merchant.settlementAddress)}
                  </span>{" "}
                  on {chainName(merchant.settlementChainKey)}.
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
