import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function OpenCartPluginPage() {
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
              BlockPay for <span className="text-accent">OpenCart</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              A production-ready stablecoin payment extension for OpenCart 3.x
              and 4.x. Settle every order on-chain, straight to the wallet you
              control.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-zinc-300">
            <p>
              The OpenCart extension installs through the standard extension
              installer. Once enabled, you configure the BlockPay payment method
              from the admin panel, paste in the settlement wallet address, and
              the new option appears alongside your existing payment methods at
              checkout.
            </p>
            <p>
              When a customer chooses BlockPay, the extension creates a payment
              session for the order total, hands off to the BlockPay checkout
              widget, and listens for the on-chain confirmation. The order
              status in OpenCart updates the moment the chain reports finality,
              with the transaction hash stored against the order record.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-8 py-10 text-center md:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              <span className="text-accent">Install instructions</span> coming soon
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">
              The extension is in private beta. Join the waitlist and we&apos;ll
              ping you with a download link and a step-by-step setup guide.
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
