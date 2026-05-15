import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  pitch: string;
  features: string[];
  cta: { label: string; href: string };
  recommended?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    pitch: "Everything you need to take your first stablecoin payment.",
    features: [
      "Up to $10k USDC monthly volume",
      "Shopify and WooCommerce plugins",
      "Gasless checkout on 4 chains",
      "On-chain signed receipts",
      "Email support",
    ],
    cta: { label: "Get started", href: "/signup" },
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "/month",
    pitch: "For shops scaling stablecoin volume across multiple surfaces.",
    features: [
      "Up to $250k USDC monthly volume",
      "All plugins plus headless SDK",
      "Gasless checkout on 12 chains",
      "Subscriptions and split payments",
      "Webhooks, custom domains, branded receipts",
      "Priority email + Discord support",
    ],
    cta: { label: "Start 14-day trial", href: "/signup" },
    recommended: true,
  },
  {
    name: "Scale",
    price: "$199",
    cadence: "/month",
    pitch: "For high-volume marketplaces and platforms with custom needs.",
    features: [
      "Unlimited USDC volume",
      "Dedicated settlement infrastructure",
      "All chains, all tokens, EURC settlement",
      "Compliance suite: OFAC + travel rule + KYT",
      "SLA-backed uptime, dedicated CSM",
      "24/7 incident response",
    ],
    cta: { label: "Talk to sales", href: "/contact" },
  },
];

const feeRows = [
  { kind: "USDC volume on Free", value: "2.4%" },
  { kind: "USDC volume on Growth", value: "1.4%" },
  { kind: "USDC volume on Scale", value: "0.9%" },
  { kind: "Non-USDC token (any tier)", value: "+0.6%" },
  { kind: "Cross-chain settlement (CCTP)", value: "Pass-through, no markup" },
  { kind: "Refunds, voids, disputes", value: "$0" },
];

export default function PricingPage() {
  return (
    <>
      <Nav active="Pricing" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-16 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Pricing
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Pay for the <span className="text-accent">volume</span> you actually settle.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              No card-network surcharges. No hidden cross-border markups. A flat
              monthly platform fee, plus a transparent percentage on USDC volume
              — drops as you grow.
            </p>
          </div>
        </section>

        <section className="px-8 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-stretch gap-6 md:grid-cols-3">
              {tiers.map((t) => (
                <TierCard key={t.name} tier={t} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Transparent <span className="text-accent">per-transaction</span> fees.
              </h2>
              <p className="mt-5 text-zinc-400">
                The percentage you pay on every USDC settlement, by tier. Cross-chain
                routes are pass-through — what Circle charges, you pay.
              </p>
            </div>
            <div className="mt-12 overflow-hidden rounded-2xl border border-[rgba(74,222,128,0.25)]">
              <div className="grid grid-cols-[1.6fr_1fr] bg-[rgba(74,222,128,0.06)] text-accent">
                <div className="px-6 py-5 font-display text-base font-semibold">
                  Fee type
                </div>
                <div className="border-l border-[rgba(74,222,128,0.18)] px-6 py-5 font-display text-base font-semibold">
                  Rate
                </div>
              </div>
              {feeRows.map((row, i) => (
                <div
                  key={row.kind}
                  className={`grid grid-cols-[1.6fr_1fr] ${
                    i !== feeRows.length - 1
                      ? "border-b border-[rgba(74,222,128,0.18)]"
                      : ""
                  }`}
                >
                  <div className="px-6 py-5 font-display text-base font-semibold text-white">
                    {row.kind}
                  </div>
                  <div className="border-l border-[rgba(74,222,128,0.18)] px-6 py-5 text-sm text-zinc-300">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Volume is computed monthly, in USD-equivalent settlement value.
              Cross-chain pass-through gas is reported on your monthly invoice.
            </p>
          </div>
        </section>

        <section className="px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Pricing <span className="text-accent">questions</span> we hear most.
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {[
                {
                  q: "Is there a contract lock-in?",
                  a: "No. Free and Growth are month-to-month. Scale customers can opt into annual billing with a 10% discount, otherwise it stays monthly.",
                },
                {
                  q: "Do you charge for refunds or chargebacks?",
                  a: "No. Refunds and voids are free. Chargebacks don't exist for stablecoin payments — disputes are handled merchant-to-customer.",
                },
                {
                  q: "What happens if I exceed my tier's volume?",
                  a: "We notify you at 80% and 100% and recommend the next tier. You won't be cut off mid-billing-cycle.",
                },
                {
                  q: "Do you offer non-profit or open-source rates?",
                  a: "Yes. Verified non-profits and registered OSS projects get Growth features at the Free tier price. Reach out via the contact form.",
                },
              ].map((f) => (
                <div key={f.q} className="card-frame-tight px-7 py-6">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {f.q}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Ship checkout in an afternoon. <span className="text-accent">For free.</span>
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-zinc-400">
              Sign up takes a minute. No card required to take your first ten
              thousand dollars of stablecoin volume.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-pill-solid text-sm">
                Create an account
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/contact" className="btn-pill text-sm">
                Talk to sales
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

function TierCard({ tier }: { tier: Tier }) {
  const recommended = tier.recommended;
  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl p-8 md:p-10 ${
        recommended
          ? "border-2 border-[rgba(74,222,128,0.6)] bg-[linear-gradient(180deg,rgba(34,80,46,0.45)_0%,rgba(8,16,11,0.7)_100%)] glow-accent"
          : "card-frame"
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4ade80] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#052e16]">
          Recommended
        </span>
      )}
      <div className="font-display text-base font-semibold text-accent">
        {tier.name}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-5xl font-bold tracking-tight text-white">
          {tier.price}
        </span>
        <span className="text-sm text-zinc-500">{tier.cadence}</span>
      </div>
      <p className="mt-3 text-sm text-zinc-400">{tier.pitch}</p>
      <div className="my-7 h-px w-full bg-[rgba(74,222,128,0.18)]" />
      <ul className="space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
            <span
              className="mt-[2px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(74,222,128,0.18)] text-[#4ade80]"
              aria-hidden="true"
            >
              <Check size={11} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <Link
          href={tier.cta.href}
          className={`${recommended ? "btn-pill-solid" : "btn-pill"} w-full justify-center text-sm`}
        >
          {tier.cta.label}
          <ChevronRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
