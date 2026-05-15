import Link from "next/link";
import { ChevronRight, Zap, Code, Package, Webhook, Plug, BookOpen } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type DocCard = {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  body: string;
  href: string;
  cta: string;
};

const cards: DocCard[] = [
  {
    Icon: Zap,
    title: "Quick Start",
    body: "Take your first stablecoin payment in five minutes. Install the SDK, paste your wallet address, render the checkout button.",
    href: "/docs",
    cta: "Read the guide",
  },
  {
    Icon: Code,
    title: "API Reference",
    body: "Every endpoint, request shape, response envelope and error code. Versioned, OpenAPI-described, batteries included.",
    href: "/docs",
    cta: "Browse endpoints",
  },
  {
    Icon: Package,
    title: "SDK & Plugins",
    body: "Drop-in React, Vue and vanilla components. Shopify, WooCommerce and Magento plugins. Server SDKs for Node, Python and Go.",
    href: "/docs",
    cta: "See packages",
  },
];

const sideTopics = [
  {
    Icon: Webhook,
    title: "Webhooks",
    body: "Subscribe to payment.succeeded, payment.refunded, payout.completed and 24 more.",
  },
  {
    Icon: Plug,
    title: "Plugins",
    body: "Shopify, WooCommerce, Magento and OpenCart with no-code setup flows.",
  },
  {
    Icon: BookOpen,
    title: "Concepts",
    body: "Mental models for paymasters, CCTP routing, allowances and signed receipts.",
  },
];

const codeLines = [
  { tokens: [{ k: "kw", v: "import" }, { k: "tx", v: " { Checkout } " }, { k: "kw", v: "from" }, { k: "str", v: " \"@blockpay/checkout\"" }, { k: "tx", v: ";" }] },
  { tokens: [{ k: "tx", v: "" }] },
  { tokens: [{ k: "kw", v: "const" }, { k: "var", v: " checkout " }, { k: "tx", v: "= " }, { k: "kw", v: "new" }, { k: "fn", v: " Checkout" }, { k: "tx", v: "({" }] },
  { tokens: [{ k: "tx", v: "  apiKey: " }, { k: "str", v: "process.env.BLOCKPAY_KEY" }, { k: "tx", v: "," }] },
  { tokens: [{ k: "tx", v: "  settleTo: " }, { k: "str", v: "\"0xA0b8…F1c2\"" }, { k: "tx", v: ", chain: " }, { k: "str", v: "\"base\"" }, { k: "tx", v: "," }] },
  { tokens: [{ k: "tx", v: "});" }] },
  { tokens: [{ k: "tx", v: "" }] },
  { tokens: [{ k: "kw", v: "await" }, { k: "var", v: " checkout" }, { k: "tx", v: "." }, { k: "fn", v: "createSession" }, { k: "tx", v: "({ amount: " }, { k: "num", v: "42" }, { k: "tx", v: " });" }] },
];

const tokenColor: Record<string, string> = {
  kw: "text-[#4ade80]",
  fn: "text-[#a5f3fc]",
  str: "text-[#fde68a]",
  var: "text-white",
  num: "text-[#f0abfc]",
  tx: "text-zinc-300",
};

export default function DocsPage() {
  return (
    <>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  Documentation
                </span>
                <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                  Build with the{" "}
                  <span className="text-accent">BlockPay SDK</span>.
                </h1>
                <p className="mt-7 max-w-xl text-base text-zinc-300">
                  A small, sharp surface for stablecoin checkout. The whole API
                  fits on a postcard — and the postcard is below.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/docs" className="btn-pill-solid text-sm">
                    Quick start
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </Link>
                  <Link href="/docs" className="btn-pill text-sm">
                    API reference
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.18),transparent_70%)] blur-2xl" />
                <CodeBlock />
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Where do you want to <span className="text-accent">start?</span>
              </h2>
              <p className="mt-5 text-zinc-400">
                Three doors into the docs. Each one ends at a working checkout.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {cards.map((c) => (
                <DocPanel key={c.title} card={c} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="card-frame grid items-stretch gap-10 p-8 md:grid-cols-[1fr_1.2fr] md:p-12">
              <div>
                <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  Go deeper into{" "}
                  <span className="text-accent">the platform</span>.
                </h3>
                <p className="mt-5 max-w-md text-zinc-400">
                  Once you have the basics, these are the most-read pages in
                  our docs. Concepts first, then concrete recipes.
                </p>
                <div className="mt-8">
                  <Link href="/docs" className="btn-pill text-sm">
                    All docs
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                {sideTopics.map((t) => {
                  const Icon = t.Icon;
                  return (
                    <div
                      key={t.title}
                      className="card-frame-tight flex items-start gap-4 px-6 py-5"
                    >
                      <span
                        className="mt-[2px] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                        aria-hidden="true"
                      >
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="font-display text-base font-semibold text-white">
                          {t.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">{t.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Stuck? <span className="text-accent">We&apos;ll unstick you.</span>
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-zinc-400">
              Email us, ping the Discord, or open a GitHub issue. Average
              first-response time is under an hour during business windows.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-pill-solid text-sm">
                Contact support
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/docs" className="btn-pill text-sm">
                Browse the docs
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

function DocPanel({ card }: { card: DocCard }) {
  const Icon = card.Icon;
  return (
    <Link
      href={card.href}
      className="card-frame group flex h-full flex-col p-8 transition-colors hover:border-[rgba(74,222,128,0.45)]"
    >
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
        aria-hidden="true"
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <h3 className="mt-6 font-display text-2xl font-semibold text-white">
        {card.title}
      </h3>
      <p className="mt-3 text-sm text-zinc-400">{card.body}</p>
      <span className="mt-auto pt-6 inline-flex items-center gap-1 text-sm text-accent">
        {card.cta}
        <ChevronRight size={14} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function CodeBlock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(74,222,128,0.25)] bg-[rgba(6,12,9,0.92)] shadow-[0_0_40px_-10px_rgba(74,222,128,0.35)]">
      <div className="flex items-center justify-between border-b border-[rgba(74,222,128,0.18)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
        </div>
        <span className="font-display text-xs uppercase tracking-[0.18em] text-zinc-500">
          checkout.ts
        </span>
        <span className="text-xs text-accent">@blockpay/checkout</span>
      </div>
      <pre className="overflow-x-auto px-6 py-6 font-mono text-[13px] leading-relaxed">
        <code>
          {codeLines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="select-none text-zinc-600" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre">
                {line.tokens.map((tok, j) => (
                  <span key={j} className={tokenColor[tok.k]}>
                    {tok.v}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
