import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";
import {
  IlloMiner,
  IlloCloud,
  IlloReceipt,
  IlloLaptop,
  IlloChart,
  IlloGlobeShield,
} from "@/components/illustrations";

type FeatureBlock = {
  num: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  bullets: string[];
  Illo: React.ComponentType<{ className?: string }>;
  flipped?: boolean;
};

const blocks: FeatureBlock[] = [
  {
    num: "01",
    eyebrow: "Gasless checkout",
    title: <>Customers never need a gas token.</>,
    body: "BlockPay sponsors gas via Circle Paymaster so buyers pay only in the token they already hold. No ETH, SOL, or chain-native fee dance — just sign and settle.",
    bullets: [
      "Paymaster underwrites every transfer, no wallet top-up needed",
      "Drop-in fallback to user-paid gas if a paymaster is unavailable",
      "Per-merchant gas budget caps with realtime spend alerts",
    ],
    Illo: IlloCloud,
  },
  {
    num: "02",
    eyebrow: "Cross-chain settlement",
    title: <>Pay on any chain, settle on one.</>,
    body: "Customers transact on the chain they prefer. You receive USDC on the chain you nominated for treasury — Circle CCTP handles the bridge with native burn-and-mint, never wrapped IOUs.",
    bullets: [
      "Routes across Ethereum, Solana, Base, Arbitrum, Polygon and Avalanche",
      "Burn-and-mint via CCTP — no wrapped-asset counterparty risk",
      "Auto-select cheapest route per transaction, surfaced as one quote",
    ],
    Illo: IlloGlobeShield,
    flipped: true,
  },
  {
    num: "03",
    eyebrow: "Accept any token",
    title: <>Quote the cart in any token, settle in USDC.</>,
    body: "Buyers pay in whatever they hold — ETH, SOL, WBTC, memecoins, stablecoins. BlockPay swaps to USDC at a binding quote with the slippage cap you set. Your books stay clean.",
    bullets: [
      "Live multi-route quoting with binding price-locks for the buyer",
      "Per-merchant slippage caps and allowlists",
      "Optional EURC settlement for European treasury accounts",
    ],
    Illo: IlloChart,
  },
  {
    num: "04",
    eyebrow: "Signed receipts",
    title: <>Every payment carries a cryptographic receipt.</>,
    body: "Receipts are signed by the merchant key, pinned to IPFS, and referenced in the transaction memo — so wallets, accountants and tax tools can render a human-readable statement without trusting a third party.",
    bullets: [
      "Line items, taxes and customer fields embedded in the receipt",
      "IPFS-pinned with a long-lived CID for audit retention",
      "Webhook delivery with retry and signature verification",
    ],
    Illo: IlloReceipt,
    flipped: true,
  },
  {
    num: "05",
    eyebrow: "Recurring billing",
    title: <>Subscriptions that renew on-chain.</>,
    body: "Programmable USDC allowances replace stored card data. Set the cadence, the cap, and the trial — BlockPay charges on schedule, sends dunning emails, and rotates allowances when they near expiry.",
    bullets: [
      "Permit-based allowances with merchant-side spend caps",
      "Smart dunning: retry on grace window, throttle on failure",
      "Plan changes pro-rated to the second, no card networks involved",
    ],
    Illo: IlloLaptop,
  },
  {
    num: "06",
    eyebrow: "Split payments",
    title: <>One payment, routed to many wallets.</>,
    body: "For marketplaces, creator platforms and partnerships. Define recipients and basis points up front — BlockPay splits inside the settlement transaction so every party gets their share atomically.",
    bullets: [
      "Up to 16 recipients per transaction, basis-point precision",
      "Per-recipient settlement chain and currency",
      "Audit-ready split records exposed via API and dashboard",
    ],
    Illo: IlloMiner,
    flipped: true,
  },
  {
    num: "07",
    eyebrow: "Compliance",
    title: <>Sanctions and KYT, built in.</>,
    body: "Every counterparty address is screened against OFAC and major sanctions lists before settlement. Tag transactions for travel-rule reporting and export to your accounting stack with one click.",
    bullets: [
      "Realtime OFAC and chain-analytics screening at checkout",
      "Travel-rule metadata captured for transfers over threshold",
      "Quarterly CSV and Xero/QuickBooks export of all settlements",
    ],
    Illo: IlloChart,
  },
];

export default function FeaturesPage() {
  return (
    <PaletteScope>
      <Nav active="Features" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                Product
              </span>
              <h1
                className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Every primitive your storefront needs to take{" "}
                <span className="text-accent">stablecoin payments</span>.
              </h1>
              <p className="mt-7 max-w-2xl text-base text-fg-muted">
                BlockPay is opinionated about the boring stuff — gas, bridging,
                receipts, compliance — so your team can focus on the parts of
                checkout that actually move conversion.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-pill-solid text-sm">
                  Start integrating
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
                <Link href="/docs" className="btn-pill text-sm">
                  Read the docs
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { k: "Median settlement", v: "8.2s", note: "from buyer signature to merchant balance" },
                { k: "Chains supported", v: "12", note: "with native CCTP routing where available" },
                { k: "Tokens accepted", v: "180+", note: "swapped at quote-locked rates to USDC" },
              ].map((s) => (
                <div key={s.k} className="card-frame-tight px-6 py-7">
                  <div className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
                    {s.k}
                  </div>
                  <div className="tnum mt-3 font-display text-4xl font-bold text-fg">
                    {s.v}
                  </div>
                  <div className="mt-2 text-sm text-fg-muted">{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
                Seven deep features, one simple SDK.
              </h2>
              <p className="mt-5 text-fg-muted">
                Each capability is exposed by the same checkout primitive. Enable
                what you need, ignore the rest.
              </p>
            </div>
            <div className="mt-20 space-y-10">
              {blocks.map((b) => (
                <FeatureCard key={b.num} block={b} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3 className="font-display text-3xl font-bold tracking-tight text-fg md:text-4xl">
              Want a guided technical walkthrough?
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-fg-muted">
              Our solutions team will walk your engineers through the
              integration end-to-end on a 30-minute call.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-pill-solid text-sm">
                Book a walkthrough
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/signup" className="btn-pill text-sm">
                See pricing
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}

function FeatureCard({ block }: { block: FeatureBlock }) {
  const Illo = block.Illo;
  const order = block.flipped ? "md:[&>div:first-child]:order-2" : "";
  return (
    <article
      className={`card-frame grid items-center gap-10 p-8 md:grid-cols-[1.1fr_1fr] md:p-12 ${order}`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-medium text-accent">
            {block.num}
          </span>
          <span className="h-px w-10 bg-[var(--border-strong)]" aria-hidden="true" />
          <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
            {block.eyebrow}
          </span>
        </div>
        <h3 className="mt-5 font-display text-3xl font-semibold leading-[1.15] text-fg md:text-4xl">
          {block.title}
        </h3>
        <p className="mt-5 max-w-md text-fg-muted">{block.body}</p>
        <ul className="mt-7 space-y-3">
          {block.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-fg">
              <span
                className="mt-[7px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/docs" className="btn-pill text-sm">
            Implementation guide
            <ChevronRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
      <div className="card-frame-tight flex aspect-[4/3] items-center justify-center p-6">
        <Illo className="h-full w-full" />
      </div>
    </article>
  );
}
