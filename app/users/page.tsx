import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";
import { UserActionsSection } from "@/components/sections/user-actions";
import { PhonePreviewSection } from "@/components/sections/phone-preview";
import { UserFaqSection } from "@/components/sections/user-faq";

export default function UsersPage() {
  return (
    <PaletteScope>
      <Nav active="For Users" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-44 pb-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                For Users
              </span>
              <h1
                className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl lg:text-7xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                Send USDC like{" "}
                <span className="text-accent">Venmo</span>.
              </h1>
              <p className="mt-7 max-w-2xl text-base text-fg-muted">
                A web3 phonebook for the people you actually pay. Settle in
                seconds, no native gas to chase, and every payment comes with
                a verifiable on-chain receipt.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/app" className="btn-pill-solid text-sm">
                  Open the app
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
                <Link href="/login" className="btn-pill text-sm">
                  Sign in with email
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <UserActionsSection />
        <PhonePreviewSection />
        <UserFaqSection />

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl card-frame px-10 py-14 text-center md:px-16">
            <h3
              className="font-display text-3xl font-bold tracking-tight text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Open the BlockPay app.
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-fg-muted">
              Sign in with email, save a few contacts, and send your first
              dollar in under a minute. Nothing to install.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/app" className="btn-pill-solid text-sm">
                Open the app
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/login" className="btn-pill text-sm">
                Sign in
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
