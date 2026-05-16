import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutCard } from "@/components/checkout/checkout-card";
import type { ReceiptLine } from "@/components/checkout/receipt";

type LineItemRow = { label: string; amount: string };

/**
 * Format USDC base-units (6 decimals) into `$X.YY USDC` for display.
 * The on-chain amount stays as a bigint for the pay() call.
 */
function formatUsdc(baseUnits: bigint): string {
  const MILLION = BigInt(1_000_000);
  const dollars = Number(baseUnits / MILLION);
  const cents = Number(baseUnits % MILLION) / 10_000;
  const v = dollars + cents / 100;
  return `$${v.toFixed(2)}`;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ return_url?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // Load the real invoice + the merchant who's getting paid.
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      merchant: { select: { businessName: true } },
    },
  });

  if (!invoice) {
    return (
      <main className="palette-stealth relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-[var(--bg)] px-6 py-12 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
          Invoice not found
        </h1>
        <p className="max-w-sm text-sm text-[var(--fg-muted)]">
          This checkout link is invalid or has expired. If the merchant just
          created it, refresh and try again.
        </p>
        <Link href="/" className="btn-pill text-sm">
          Back to BlockPay
        </Link>
      </main>
    );
  }

  if (invoice.status === "paid") {
    redirect(`/checkout/${invoice.id}/success`);
  }

  // Parse line items + compute the display total.
  const lineItemRows = (invoice.lineItems as unknown as LineItemRow[]) || [];
  const amountBaseUnits = BigInt(invoice.amount);
  const totalLabel = `${formatUsdc(amountBaseUnits)} ${invoice.currency}`;

  // Receipt rows: merchant-defined lines + a synthetic Total row.
  const receipt: ReceiptLine[] = [
    ...lineItemRows.map((r) => ({ label: r.label, amount: r.amount })),
    { label: "Total", amount: totalLabel, emphasis: true },
  ];

  return (
    <main className="palette-stealth relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <CheckoutCard
          merchantName={invoice.merchant.businessName}
          invoiceId={invoice.id}
          onChainInvoiceId={invoice.onChainInvoiceId as `0x${string}`}
          lineItems={receipt}
          totalLabel={totalLabel}
          amountUsdc={amountBaseUnits}
          merchantAddress={invoice.merchantAddress as `0x${string}`}
          payHref={
            sp.return_url
              ? `/checkout/${invoice.id}/success?return_url=${encodeURIComponent(sp.return_url)}`
              : `/checkout/${invoice.id}/success`
          }
        />
      </div>
    </main>
  );
}
