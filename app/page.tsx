import Link from "next/link";
import { ChevronRight, Store, Wallet } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export default function Home() {
  return (
    <PaletteScope>
      <Nav />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-44 pb-16">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                BlockPay
              </span>
              <h1
                className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl lg:text-7xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Stablecoin payments for{" "}
                <span className="text-accent">everyone</span>.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base text-fg-muted">
                A single rail for moving USDC. Storefronts settle to their own
                wallet on the chain they choose. People send and request money
                with a phonebook — no seed phrases, no native gas to chase.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 pb-12">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
            <ForkTile
              icon={<Store size={28} strokeWidth={1.8} />}
              eyebrow="For Businesses"
              title="Accept stablecoin payments"
              body="One-click Shopify and WooCommerce apps, a typed SDK for everything else. Funds settle non-custodially to a wallet you control."
              ctaLabel="Start accepting"
              ctaHref="/business"
            />
            <ForkTile
              icon={<Wallet size={28} strokeWidth={1.8} />}
              eyebrow="For Users"
              title="Send USDC like Venmo"
              body="Save people by ENS, SNS or email. Settle instantly with a signed receipt for every payment — gas is sponsored by Circle Paymaster."
              ctaLabel="Open the app"
              ctaHref="/users"
            />
          </div>
        </section>

        <section className="px-8 pb-32 pt-6">
          <div className="mx-auto max-w-4xl">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-fg-muted">
              <li className="flex items-center gap-2">
                <Dot />
                Non-custodial settlement
              </li>
              <li className="flex items-center gap-2">
                <Dot />
                Gasless checkout via Circle Paymaster
              </li>
              <li className="flex items-center gap-2">
                <Dot />
                Live on testnet
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}

function ForkTile({
  icon,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <Link
      href={ctaHref}
      className="card-frame group relative flex flex-col p-12 transition-colors hover:card-active md:p-14"
    >
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] text-accent"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="mt-7 text-xs uppercase tracking-[0.18em] text-fg-subtle">
        {eyebrow}
      </div>
      <h2
        className="mt-3 font-display text-[32px] font-semibold leading-[1.1] text-fg"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>
      <p className="mt-5 max-w-sm text-fg-muted">{body}</p>
      <div className="mt-10 flex">
        <span className="btn-pill-solid text-sm">
          {ctaLabel}
          <ChevronRight size={16} strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--accent)]"
      aria-hidden="true"
    />
  );
}
