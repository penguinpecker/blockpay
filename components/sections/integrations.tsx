import Link from "next/link";
import { ChevronRight, ShoppingBag, Globe, Code2 } from "lucide-react";

type Integration = {
  name: string;
  blurb: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const integrations: Integration[] = [
  {
    name: "Shopify",
    blurb:
      "Install the BlockPay Shopify App from the App Store. Two clicks, settles USDC straight to your wallet.",
    href: "/docs/shopify",
    Icon: ShoppingBag,
  },
  {
    name: "WooCommerce",
    blurb:
      "Upload the BlockPay plugin to your WP admin. Customers see ‘Pay with USDC’ at checkout.",
    href: "/docs/wordpress",
    Icon: Globe,
  },
  {
    name: "Custom API + SDK",
    blurb:
      "Use the @blockpay/checkout SDK to embed payments anywhere. REST API + signed webhooks.",
    href: "/docs/sdk",
    Icon: Code2,
  },
];

export function IntegrationsSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            Plug into your stack in minutes
          </h2>
          <p className="mt-5 text-fg-muted">
            BlockPay ships first-party apps for the storefronts you already
            run, and a typed SDK for everything else.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {integrations.map(({ name, blurb, href, Icon }) => (
            <Link
              key={name}
              href={href}
              className="card-frame group flex flex-col p-8 transition-colors hover:card-active"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elev)] text-accent"
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-fg">
                {name}
              </h3>
              <p className="mt-3 text-sm text-fg-muted">{blurb}</p>
              <span className="mt-7 inline-flex items-center gap-1 text-sm text-accent">
                Read the guide
                <ChevronRight size={14} strokeWidth={2.4} />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.18em] text-fg-subtle">
          Hosted docs migrating to Mintlify soon.
        </p>
      </div>
    </section>
  );
}
