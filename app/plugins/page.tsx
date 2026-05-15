import Link from "next/link";
import { ChevronRight, ShoppingBag, ShoppingCart, Store, Code2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type Plugin = {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  body: string;
  cta: string;
  href: string;
  badge?: string;
};

const plugins: Plugin[] = [
  {
    Icon: ShoppingBag,
    title: "Shopify App",
    body: "Native Shopify checkout integration. Settle every order in USDC or EURC, straight to the merchant wallet.",
    cta: "Notify me",
    href: "/signup",
    badge: "Coming Soon",
  },
  {
    Icon: ShoppingCart,
    title: "WooCommerce",
    body: "Drop-in plugin for any WordPress store. Install via the WP admin, paste your settlement address, accept stablecoins.",
    cta: "View plugin",
    href: "/plugins/woocommerce",
  },
  {
    Icon: Store,
    title: "OpenCart",
    body: "Production-ready extension for OpenCart 3.x and 4.x. Same install model, same settlement model.",
    cta: "View plugin",
    href: "/plugins/opencart",
  },
  {
    Icon: Code2,
    title: "Custom integration",
    body: "Building a bespoke storefront? The SDK fits on a postcard and the docs walk you through it end to end.",
    cta: "Read the docs",
    href: "/docs",
  },
];

export default function PluginsPage() {
  return (
    <>
      <Nav active="Developers" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Plugins
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              <span className="text-accent">Plugins</span> for every platform
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              Whatever you run your store on, BlockPay slots in. One settlement
              address, every checkout, on-chain.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2">
              {plugins.map((p) => {
                const Icon = p.Icon;
                return (
                  <Link
                    key={p.title}
                    href={p.href}
                    className="card-frame group flex h-full flex-col p-8 transition-colors hover:border-[rgba(74,222,128,0.45)]"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                        aria-hidden="true"
                      >
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      {p.badge && (
                        <span className="rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-accent">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold text-white">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {p.body}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm text-accent">
                      {p.cta}
                      <ChevronRight
                        size={14}
                        strokeWidth={2.4}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
