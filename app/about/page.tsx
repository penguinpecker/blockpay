import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export default function AboutPage() {
  return (
    <PaletteScope>
      <Nav active="Company" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              About
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              About <span className="text-accent">BlockPay</span>
            </h1>
          </div>
        </section>

        <section className="px-8 pb-20">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-fg-muted">
            <p>
              BlockPay is a non-custodial stablecoin commerce stack. Funds settle
              directly to the merchant&apos;s wallet on every payment — we never
              take custody, we never hold a float, and we never have the
              authority to move a dollar that isn&apos;t ours. The product is
              built around a simple promise: a merchant who installs BlockPay
              today should be able to walk away tomorrow with no migration, no
              ticket queue, and no permission slip.
            </p>
            <p>
              We build on the Circle stack. USDC and EURC give us a clean,
              audited unit of account; CCTP and Bridge Kit give us composable
              routing across chains; Circle&apos;s programmable wallets and
              paymaster infrastructure handle the rough edges so we can focus on
              the merchant surface. The result is a checkout that looks like
              Stripe and settles like a wire — but on rails the merchant
              actually owns.
            </p>
            <p>
              Audit-ready code is a culture, not a checklist. Every contract is
              minimal, every dependency is pinned, every state transition is
              traceable on-chain. The team ships small, reviews carefully, and
              treats a failed test as a failed deploy. If you care about how
              stablecoin commerce gets built, you&apos;re probably already the
              kind of person we&apos;d want to talk to.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-8 py-10 md:px-12">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
              Live on the internet
            </h2>
            <p className="mt-4 text-sm text-fg-muted">
              BlockPay is deployed and processing real testnet flows today. You
              can poke around, watch a checkout settle, and read the receipts
              on-chain.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex flex-wrap items-center gap-2">
                <span className="text-fg-subtle">Production:</span>
                <a
                  href="https://blockpay-six.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  blockpay-six.vercel.app
                  <ExternalLink size={12} strokeWidth={2.2} />
                </a>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <span className="text-fg-subtle">Sample transaction:</span>
                <a
                  href="https://sepolia.basescan.org/address/0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  View tx proof on Basescan
                  <ExternalLink size={12} strokeWidth={2.2} />
                </a>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/signup" className="btn-pill text-sm">
                Talk to us
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
