import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CheckoutCard } from "@/components/checkout/checkout-card";
import { prisma } from "@/lib/prisma";
import type { Address } from "viem";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadLink(slug: string) {
  const link = await prisma.paymentLink.findUnique({
    where: { slug },
    include: { merchant: true },
  });
  return link;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await loadLink(slug);
  if (!link) {
    return {
      title: "Link not available · BlockPay",
      description: "This payment link is no longer available.",
    };
  }
  const title = `Pay ${link.label} · BlockPay`;
  const description =
    link.description ??
    `Pay ${link.label} to ${link.merchant.businessName} via BlockPay — non-custodial USDC checkout.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * Split a base-unit amount into (symbol, integer part with thousands separators, cents).
 * Returns the magnitude separately so the hero can render cents at .cents scale.
 */
function splitAmount(
  baseUnits: string,
  currency: string,
): { symbol: string; whole: string; cents: string; humanString: string } {
  const symbol = currency === "EURC" ? "€" : "$";
  try {
    const value = BigInt(baseUnits);
    const whole = value / BigInt(1_000_000);
    const rem = value % BigInt(1_000_000);
    const cents = Number(rem / BigInt(10_000));
    const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const centsStr = cents.toString().padStart(2, "0");
    return {
      symbol,
      whole: wholeStr,
      cents: centsStr,
      humanString: `${symbol}${wholeStr}.${centsStr}`,
    };
  } catch {
    return { symbol, whole: baseUnits, cents: "00", humanString: `${symbol}${baseUnits}` };
  }
}

export default async function PayBySlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const link = await loadLink(slug);

  if (!link || !link.active) {
    return (
      <div className="palette-stealth relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
        <Nav />
        <main className="relative flex flex-1 items-center justify-center px-6 pt-32 pb-16">
          <div className="card-frame w-full max-w-md p-8 text-center">
            <div className="font-display text-2xl font-semibold text-[var(--fg)]">
              Link not available
            </div>
            <p className="mt-3 text-sm text-[var(--fg-muted)]">
              {link
                ? "This payment link has been archived by the merchant."
                : "We could not find a payment link with that address. It may have been removed."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const amountBigInt = (() => {
    try {
      return BigInt(link.amount);
    } catch {
      return BigInt(0);
    }
  })();

  const amount = splitAmount(link.amount, link.currency);
  const merchantAddress = link.merchant.settlementAddress as Address;
  const merchantInitial = link.merchant.businessName.charAt(0).toUpperCase();
  // Best-effort verified-domain microcopy. Prefer an explicit domain field if it exists.
  const merchantDomain =
    (link.merchant as unknown as { domain?: string | null }).domain ?? null;

  return (
    <div className="palette-stealth relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Nav />
      <main className="relative flex flex-1 flex-col items-center px-6 pt-28 pb-20">
        {/* Top third — merchant brand strip */}
        <section className="flex w-full max-w-md flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] font-display text-lg font-bold text-[var(--fg)]"
            aria-hidden="true"
          >
            {merchantInitial}
          </div>
          <div className="mt-3 font-display text-[18px] font-medium text-[var(--fg)]">
            {link.merchant.businessName}
          </div>
          {merchantDomain ? (
            <div className="mt-1 text-[10px] text-[var(--fg-subtle)]">
              Verified domain · {merchantDomain}
            </div>
          ) : (
            <div className="mt-1 text-[10px] text-[var(--fg-subtle)]">
              Verified merchant
            </div>
          )}
        </section>

        {/* Center — hero amount with vignette */}
        <section className="hero-vignette mt-10 flex w-full max-w-md flex-col items-center text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
            Amount due
          </div>
          <div
            className="mt-3 flex items-baseline justify-center font-display tnum"
            style={{
              fontWeight: 500,
              fontSize: "88px",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            <span>
              {amount.symbol}
              {amount.whole}
            </span>
            <span className="cents">.{amount.cents}</span>
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            {link.currency}
          </div>
          {link.description ? (
            <p className="mt-4 max-w-sm text-sm text-[var(--fg-muted)]">
              {link.description}
            </p>
          ) : (
            <p className="mt-4 max-w-sm text-sm text-[var(--fg-muted)]">
              {link.label}
            </p>
          )}
        </section>

        {/* Bottom — primary CTA + scroll-to-checkout text link */}
        <section className="mt-8 flex w-full max-w-sm flex-col items-center">
          <a
            href="#checkout"
            className="btn-pill-solid w-full justify-center text-sm"
          >
            <span className="tnum">{`Pay ${amount.humanString} ${link.currency}`}</span>
          </a>
          <a
            href="#checkout"
            className="mt-3 text-[12px] text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
          >
            Pay with another method
          </a>
        </section>

        {/* Expanded checkout card target */}
        <section id="checkout" className="mt-16 w-full max-w-md">
          <CheckoutCard
            merchantName={link.merchant.businessName}
            invoiceId={link.slug}
            lineItems={[
              { label: link.label, amount: `${amount.humanString} ${link.currency}` },
              {
                label: "Total",
                amount: `${amount.humanString} ${link.currency}`,
                emphasis: true,
              },
            ]}
            totalLabel={`${amount.humanString} ${link.currency}`}
            amountUsdc={amountBigInt}
            merchantAddress={merchantAddress}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
