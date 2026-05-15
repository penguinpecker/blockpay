import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import {
  IlloLaptop,
  IlloReceipt,
  IlloCloud,
  IlloChart,
  IlloMiner,
} from "@/components/illustrations";

type Vertical = {
  tag: string;
  name: string;
  pitch: string;
  bullets: string[];
  cta: { label: string; href: string };
  Illo: React.ComponentType<{ className?: string }>;
};

const verticals: Vertical[] = [
  {
    tag: "E-commerce",
    name: "Shopify",
    pitch:
      "A one-click app that adds USDC as a checkout option next to your existing payment methods. Settle to your wallet on the chain you nominate — no smart-contract knowledge required from your storefront team.",
    bullets: [
      "Listed on the Shopify App Store, two-minute install",
      "Surfaces stablecoin pay-with on the standard checkout page",
      "Refunds, partial captures and discounts work as Shopify expects",
    ],
    cta: { label: "Install for Shopify", href: "/docs" },
    Illo: IlloLaptop,
  },
  {
    tag: "Open source",
    name: "WooCommerce",
    pitch:
      "A WordPress plugin that brings BlockPay to every WooCommerce storefront. Drop in the gateway, paste your settlement address, take live payments — without changing your theme.",
    bullets: [
      "Works with any WooCommerce 7+ theme out of the box",
      "Wallet-side approvals replace stored card data",
      "Order metadata, taxes and shipping flow through unchanged",
    ],
    cta: { label: "Get the WooCommerce plugin", href: "/docs" },
    Illo: IlloCloud,
  },
  {
    tag: "Multi-party",
    name: "Marketplaces",
    pitch:
      "Pay every seller, creator and partner atomically inside the same settlement transaction. Define recipients and basis points up front — BlockPay enforces the split on-chain.",
    bullets: [
      "Up to 16 recipients per payment, basis-point precision",
      "Per-recipient chain and currency, independently configurable",
      "Audit trail exposed via API and the marketplace dashboard",
    ],
    cta: { label: "Marketplace API guide", href: "/docs" },
    Illo: IlloMiner,
  },
  {
    tag: "Recurring",
    name: "SaaS subscriptions",
    pitch:
      "Programmable USDC allowances replace stored credit card data. Set the cadence and the cap; BlockPay charges on schedule, retries failures and rotates allowances before they expire.",
    bullets: [
      "Permit-based allowances with merchant-side spend caps",
      "Smart dunning with grace windows and configurable retries",
      "Plan changes pro-rated to the second, no card-network round trips",
    ],
    cta: { label: "Subscription billing docs", href: "/docs" },
    Illo: IlloReceipt,
  },
  {
    tag: "Retail",
    name: "In-person POS",
    pitch:
      "Tablet-based point of sale with QR-led wallet checkout. Customer scans, signs and pays gaslessly. You print a receipt with the on-chain CID attached.",
    bullets: [
      "iPad and Android tablet apps, offline-resilient queue",
      "QR payment requests with binding price-lock and 90s expiry",
      "Receipt printer integrations for Star, Epson and Brother",
    ],
    cta: { label: "POS hardware setup", href: "/docs" },
    Illo: IlloChart,
  },
];

export default function SolutionsPage() {
  return (
    <>
      <Nav active="Solutions" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Solutions
              </span>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                One payment rail, every{" "}
                <span className="text-accent">selling surface</span>.
              </h1>
              <p className="mt-7 max-w-2xl text-base text-zinc-300">
                BlockPay slots into the storefront stack you already run. Pick
                your surface — Shopify, WooCommerce, your own marketplace, a
                SaaS billing flow, or an in-store tablet — and ship stablecoin
                checkout this week.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-pill-solid text-sm">
                  Start free
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
                <Link href="/contact" className="btn-pill text-sm">
                  Talk to sales
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {verticals.map((v) => (
                <a
                  key={v.name}
                  href={`#${v.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="card-frame-tight flex flex-col gap-2 px-5 py-5 transition-colors hover:border-[rgba(74,222,128,0.5)]"
                >
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {v.tag}
                  </span>
                  <span className="font-display text-lg font-semibold text-white">
                    {v.name}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs text-accent">
                    Jump to section
                    <ChevronRight size={12} strokeWidth={2.4} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="mx-auto max-w-7xl space-y-10">
            {verticals.map((v, i) => (
              <VerticalCard key={v.name} v={v} flipped={i % 2 === 1} />
            ))}
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Don&apos;t see your <span className="text-accent">surface?</span>
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-zinc-400">
              The BlockPay SDK is framework-agnostic. If you can render a button,
              you can take stablecoin payments. Tell us what you&apos;re building.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-pill-solid text-sm">
                Talk to an engineer
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/docs" className="btn-pill text-sm">
                Read the SDK docs
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function VerticalCard({ v, flipped }: { v: Vertical; flipped: boolean }) {
  const Illo = v.Illo;
  const order = flipped ? "md:[&>div:first-child]:order-2" : "";
  return (
    <article
      id={v.name.toLowerCase().replace(/\s+/g, "-")}
      className={`card-frame grid scroll-mt-32 items-center gap-10 p-8 md:grid-cols-[1.1fr_1fr] md:p-12 ${order}`}
    >
      <div>
        <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {v.tag}
        </span>
        <h3 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
          BlockPay for <span className="text-accent">{v.name}</span>.
        </h3>
        <p className="mt-5 max-w-md text-zinc-400">{v.pitch}</p>
        <ul className="mt-7 space-y-3">
          {v.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
              <span
                className="mt-[7px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-[#4ade80]"
                aria-hidden="true"
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href={v.cta.href} className="btn-pill text-sm">
            {v.cta.label}
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
