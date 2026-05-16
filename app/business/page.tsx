import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";
import { FlowSection } from "@/components/sections/flow";
import { FeaturesSection } from "@/components/sections/features";
import { IntegrationsSection } from "@/components/sections/integrations";
import { CompareSection } from "@/components/sections/compare";
import { FaqSection } from "@/components/sections/faq";

export default function BusinessPage() {
  return (
    <PaletteScope>
      <Nav active="For Business" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-44 pb-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                For Businesses
              </span>
              <h1
                className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl lg:text-7xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Accept{" "}
                <span className="text-accent">stablecoins</span> on your
                site.
              </h1>
              <p className="mt-7 max-w-2xl text-base text-fg-muted">
                BlockPay is a non-custodial payment gateway for USDC and EURC.
                Drop it into Shopify, WooCommerce, or your own checkout, and
                settle funds straight to a wallet you control — on the chain
                you choose.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-pill-solid text-sm">
                  Sign up
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
                <Link href="/docs" className="btn-pill text-sm">
                  Read the docs
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FlowSection />
        <FeaturesSection />
        <IntegrationsSection />
        <CompareSection />
        <FaqSection />

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3
              className="font-display text-3xl font-bold tracking-tight text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Start accepting USDC today.
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-fg-muted">
              Spin up an account, paste your settlement wallet, ship a Pay
              with USDC button at checkout. No card-network underwriting, no
              custody handover.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-pill-solid text-sm">
                Sign up
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/embed/preview" className="btn-pill text-sm">
                See the live demo
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
