import Link from "next/link";
import { ChevronRight, BookOpen, Mail, Activity } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type InfoCard = {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
};

const cards: InfoCard[] = [
  {
    Icon: BookOpen,
    title: "Read the docs",
    body: "Quick start, API reference, plugin guides and recipes. Most questions answer themselves once you've skimmed the right page.",
    cta: "Open docs",
    href: "/docs",
  },
  {
    Icon: Mail,
    title: "Email us",
    body: "Real humans, real first-response times. Best path for integration questions, billing, and anything account-specific.",
    cta: "hello@blockpay.dev",
    href: "mailto:hello@blockpay.dev",
    external: true,
  },
  {
    Icon: Activity,
    title: "Status page",
    body: "Live operational status for the dashboard, API, indexers and supported networks. Check here before you file a ticket.",
    cta: "View status",
    href: "/status",
  },
];

const faqs = [
  {
    q: "How do refunds work?",
    a: "Refunds are issued from the merchant's settlement wallet back to the customer's paying address. Because BlockPay is non-custodial, the merchant authorizes each refund directly — we never move funds on a merchant's behalf.",
  },
  {
    q: "What chains do you support?",
    a: "Base, Arc, Ethereum mainnet and the corresponding testnets are live today. We add new chains where there's clean USDC / EURC liquidity and predictable settlement.",
  },
  {
    q: "Is my custody non-custodial?",
    a: "Yes. Funds settle directly to the wallet you configure in the dashboard. BlockPay does not operate an omnibus account, cannot freeze your balance, and cannot move your funds.",
  },
  {
    q: "How long does settlement take?",
    a: "Confirmation time is governed by the underlying chain — typically a couple of seconds on Base and Arc. We expose a webhook the instant the chain reports finality.",
  },
  {
    q: "Do you support non-USDC tokens?",
    a: "Yes, via Bridge Kit. Customers can pay in supported assets and the merchant still settles in USDC or EURC, with the conversion quoted at payment time.",
  },
];

export default function SupportPage() {
  return (
    <>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Support
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              <span className="text-accent">Support</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              Three ways to get help. Pick the one that fits the question.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((c) => {
                const Icon = c.Icon;
                const Inner = (
                  <>
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                      aria-hidden="true"
                    >
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <h3 className="mt-6 font-display text-2xl font-semibold text-white">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-sm text-zinc-400">{c.body}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm text-accent">
                      {c.cta}
                      <ChevronRight size={14} strokeWidth={2.4} />
                    </span>
                  </>
                );
                return c.external ? (
                  <a
                    key={c.title}
                    href={c.href}
                    className="card-frame group flex h-full flex-col p-8 transition-colors hover:border-[rgba(74,222,128,0.45)]"
                  >
                    {Inner}
                  </a>
                ) : (
                  <Link
                    key={c.title}
                    href={c.href}
                    className="card-frame group flex h-full flex-col p-8 transition-colors hover:border-[rgba(74,222,128,0.45)]"
                  >
                    {Inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-4xl card-frame px-8 py-10 md:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Frequently <span className="text-accent">asked</span>
            </h2>
            <div className="mt-8 divide-y divide-[rgba(74,222,128,0.12)]">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                    <span className="font-display text-base font-semibold text-white">
                      {f.q}
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={2.4}
                      className="shrink-0 text-accent transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
