import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function WooCommercePluginPage() {
  return (
    <>
      <Nav active="Developers" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Plugin
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              BlockPay for <span className="text-accent">WooCommerce</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              A drop-in payment method for any WordPress + WooCommerce store.
              Settle every order in stablecoins, with no custodial middleman.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-zinc-300">
            <p>
              The WooCommerce plugin installs from the WordPress admin like any
              other payment gateway. Once active, you configure a single
              settlement address in the plugin settings — the wallet you want
              BlockPay to route every successful order to — and the new payment
              option appears at checkout for your customers.
            </p>
            <p>
              At checkout, the plugin generates a BlockPay session for the cart
              total, displays the QR / wallet handoff, and listens for the
              on-chain confirmation. The order in WooCommerce moves to
              processing the moment the chain reports finality, with the
              transaction hash stored against the order for audit and refunds.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-8 py-10 text-center md:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              <span className="text-accent">Install instructions</span> coming soon
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">
              The plugin is in private beta. Join the waitlist and we&apos;ll
              ping you with a download link and a 10-minute setup guide.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="btn-pill-solid text-sm">
                Join the waitlist
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
