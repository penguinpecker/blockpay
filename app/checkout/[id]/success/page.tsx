import Link from "next/link";
import { CheckCircle2, Download, ChevronRight } from "lucide-react";
import { Receipt, StepRail, type Step } from "@/components/checkout/receipt";
import { prisma } from "@/lib/prisma";
import { CHAINS } from "@/lib/contracts";

type LineItemRow = { label: string; amount: string };

function formatUsdc(baseUnits: bigint): string {
  const MILLION = BigInt(1_000_000);
  const dollars = Number(baseUnits / MILLION);
  const cents = Number(baseUnits % MILLION) / 10_000;
  const v = dollars + cents / 100;
  return `$${v.toFixed(2)}`;
}

function truncateMid(s: string, head = 6, tail = 4) {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

const COMPLETED_STEPS: Step[] = [
  { label: "Pay", state: "complete" },
  { label: "Submit", state: "complete" },
  { label: "Confirm", state: "complete" },
  { label: "Settled", state: "complete" },
];

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ return_url?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // Real invoice + most recent payment row for this on-chain invoice id.
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      merchant: { select: { businessName: true } },
      payments: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  // If invoice doesn't exist OR isn't paid yet, show a "pending" state instead
  // of pretending it's settled.
  const isPaid = invoice?.status === "paid";
  const payment = invoice?.payments[0];

  const lineItemRows = ((invoice?.lineItems as unknown as LineItemRow[]) || []);
  const totalLabel = invoice
    ? `${formatUsdc(BigInt(invoice.amount))} ${invoice.currency}`
    : "—";

  const lineItems = invoice
    ? [
        ...lineItemRows.map((r) => ({ label: r.label, amount: r.amount })),
        { label: "Total", amount: totalLabel, emphasis: true as const },
      ]
    : [];

  const chainKey = invoice?.chainKey ?? "arc-testnet";
  const chainCfg = CHAINS[chainKey as keyof typeof CHAINS];
  const chainName = chainCfg?.name ?? chainKey;

  const txHash = payment?.txHash;
  const txExplorer =
    txHash && chainCfg ? `${chainCfg.explorerBase}/tx/${txHash}` : undefined;

  const meta: { label: string; value: string; fullValue?: string; mono?: boolean }[] = [];
  if (txHash) {
    meta.push({
      label: "Transaction",
      value: truncateMid(txHash),
      fullValue: txHash,
      mono: true,
    });
  }
  if (invoice?.memoCid) {
    meta.push({
      label: "Receipt CID",
      value: truncateMid(invoice.memoCid),
      fullValue: invoice.memoCid,
      mono: true,
    });
  }
  meta.push({ label: "Chain", value: chainName });
  meta.push({
    label: "Settled",
    value: isPaid ? `${invoice?.currency ?? "USDC"} · Instant` : "Pending",
  });

  const headline = isPaid ? "Payment received" : "Confirming on-chain";
  const subline =
    isPaid && invoice
      ? `Invoice ${invoice.id} settled on-chain to ${invoice.merchant.businessName}.`
      : invoice
        ? `Invoice ${invoice.id} is being indexed. This usually takes a few seconds — refresh in a moment.`
        : "Invoice not found.";

  const returnHref =
    sp.return_url && /^\//.test(sp.return_url) // only allow same-site
      ? txHash
        ? `${sp.return_url}${sp.return_url.includes("?") ? "&" : "?"}tx=${txHash}`
        : sp.return_url
      : "/";
  const returnLabel = sp.return_url ? "Back to merchant" : "Back to BlockPay";

  return (
    <main className="palette-stealth relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="card-frame card-active p-6 md:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--mint)_12%,transparent)]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--mint)_35%,transparent),transparent_70%)] blur-md" />
              <CheckCircle2
                size={40}
                strokeWidth={2}
                className="relative text-[var(--mint)]"
              />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
              {headline}
            </h1>
            <p className="mt-2 max-w-xs text-sm text-[var(--fg-muted)]">
              {subline}
            </p>
          </div>

          {invoice ? (
            <>
              <div className="mt-6">
                <StepRail steps={COMPLETED_STEPS} />
              </div>

              <div className="mt-6">
                <Receipt lines={lineItems} meta={meta} />
              </div>
            </>
          ) : null}

          <div className="mt-6 grid gap-3">
            {txExplorer ? (
              <a
                href={txExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill w-full justify-center text-sm"
              >
                <Download size={16} strokeWidth={2.4} />
                View on-chain
              </a>
            ) : null}
            <Link
              href={returnHref}
              className="btn-pill-solid w-full justify-center text-sm"
            >
              {returnLabel}
              <ChevronRight size={16} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4 text-center text-[11px] text-[var(--fg-subtle)]">
            Powered by BlockPay
          </div>
        </div>
      </div>
    </main>
  );
}
