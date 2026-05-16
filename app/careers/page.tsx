import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type Role = {
  title: string;
  bullets: string[];
};

const roles: Role[] = [
  {
    title: "Founding Engineer — Solidity",
    bullets: [
      "Own the on-chain surface: router, settlement, refund, paymaster glue. Ship small, audit-minded contracts.",
      "5+ years writing production code; meaningful Solidity experience; can read a tx trace without sweating.",
      "Based anywhere — remote-first team, async by default, 4-hour overlap with Europe / India windows.",
    ],
  },
  {
    title: "Founding Engineer — Frontend",
    bullets: [
      "Build the merchant dashboard, checkout widget and embed SDK. React 19, Next 16, design system already in place.",
      "Strong TypeScript, opinions about state management, and an eye for the kind of UI a developer actually wants to use.",
      "Based anywhere — remote-first team, async by default, 4-hour overlap with Europe / India windows.",
    ],
  },
  {
    title: "Developer Relations",
    bullets: [
      "Write the docs, record the screencasts, run the office hours, and own the first 48 hours of every integration.",
      "Background in payments, wallets or developer tooling. Comfortable shipping code samples and PRs.",
      "Based anywhere — remote-first team, async by default, 4-hour overlap with Europe / India windows.",
    ],
  },
];

export default function CareersPage() {
  return (
    <PaletteScope>
      <Nav active="Company" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Careers
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Join the team building{" "}
              <span className="text-accent">stablecoin commerce</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-fg-muted">
              Small team, big surface area, real merchants on the other side of
              every commit. If you want your work to settle on-chain by Friday,
              read on.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-4xl card-frame px-8 py-10 md:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
              We&apos;re hiring
            </h2>
            <p className="mt-3 text-sm text-fg-muted">
              Three roles open right now. Send a short note and a link to
              something you&apos;ve shipped — code, writing, anything real.
            </p>
            <div className="mt-10 space-y-6">
              {roles.map((r) => (
                <div
                  key={r.title}
                  className="card-frame-tight flex flex-col gap-5 px-7 py-7 md:flex-row md:items-start md:justify-between"
                >
                  <div className="md:max-w-xl">
                    <h3 className="font-display text-xl font-semibold text-fg">
                      {r.title}
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                      {r.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                            aria-hidden="true"
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0">
                    <Link href="/contact" className="btn-pill text-sm">
                      Contact us
                      <ChevronRight size={16} strokeWidth={2.4} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}
