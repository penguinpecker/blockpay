import Link from "next/link";
import { ChevronRight, Code, Layers, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CheckoutCard } from "@/components/checkout/checkout-card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "One-line embed",
    body: "Drop the BlockPay checkout into any page with a single script tag. No iframe gymnastics, no redirects.",
  },
  {
    icon: Layers,
    title: "Any token, any chain",
    body: "Shoppers pay with USDC, USDT, ETH or SOL across Arc, Base, Ethereum or Solana. You always settle in your chosen asset.",
  },
  {
    icon: Code,
    title: "Built for developers",
    body: "Themed to match your brand, fully accessible, and shipped with TypeScript types. Production-ready out of the box.",
  },
];

export default function EmbedPreviewPage() {
  return (
    <>
      <Nav active="Solutions" />
      <main className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-grid bg-grid-fade"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]"
          aria-hidden="true"
        />

        <section className="relative mx-auto max-w-7xl px-8 pt-44 pb-24">
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent">
                Live preview
              </div>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                See <span className="text-accent">BlockPay</span>
                <br />
                Checkout in
                <br />
                Action
              </h1>
              <p className="mt-8 max-w-md text-base text-zinc-300">
                The same widget your customers see at checkout — fully
                interactive, no install required. Toggle tokens, swap chains,
                and watch the gas-sponsored flow render in real time.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/docs" className="btn-pill-solid text-sm">
                  Read the docs
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
                <Link href="/checkout/inv_demo_001" className="btn-pill text-sm">
                  Open standalone
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
              </div>

              <ul className="mt-14 grid gap-6">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.title} className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)]"
                        aria-hidden="true"
                      >
                        <Icon size={18} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-white">
                          {f.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">{f.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative flex items-start justify-center lg:justify-end">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.15),transparent_60%)] blur-2xl" />
              <div className="relative w-full max-w-md">
                <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <span>blockpay.embed</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Demo mode
                  </span>
                </div>
                <CheckoutCard
                  merchantName="Acme Storefront"
                  invoiceId="inv_demo_001"
                  payHref="/checkout/inv_demo_001/success"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
