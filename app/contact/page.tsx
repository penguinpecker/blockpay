"use client";

import Link from "next/link";
import { ChevronRight, Mail, MessageCircle, AtSign } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

const volumeOptions = [
  "Less than $10k / month",
  "$10k – $100k / month",
  "$100k – $1M / month",
  "$1M – $10M / month",
  "More than $10M / month",
];

export default function ContactPage() {
  return (
    <PaletteScope>
      <Nav active="Contact" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Contact
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Talk to the team building{" "}
              <span className="text-accent">stablecoin checkout</span>.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-fg-muted">
              Whether you&apos;re scoping an integration, comparing pricing, or just
              kicking the tires — we read every message and reply within one
              business day.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div className="card-frame p-8 md:p-12">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
                  Tell us about your project.
                </h2>
                <p className="mt-3 text-sm text-fg-muted">
                  A few quick fields. Anything we&apos;re missing — drop it in
                  the message box.
                </p>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="mt-9 grid gap-5"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Name" htmlFor="name">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Company" htmlFor="company">
                      <input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Analytical Engines Ltd."
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Work email" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ada@example.com"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Monthly volume estimate" htmlFor="volume">
                    <select
                      id="volume"
                      name="volume"
                      defaultValue=""
                      className={`${inputCls} appearance-none pr-10`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M3 4.5 L6 7.5 L9 4.5' stroke='%234ade80' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                      }}
                    >
                      <option value="" disabled>
                        Select an estimate
                      </option>
                      {volumeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="What are you building?" htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="A short description of the surface, chains and tokens you want to support."
                      className={`${inputCls} resize-y`}
                    />
                  </Field>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-fg-subtle">
                      By submitting, you agree to be contacted about your inquiry.
                    </p>
                    <button type="submit" className="btn-pill-solid text-sm">
                      Send message
                      <ChevronRight size={16} strokeWidth={2.4} />
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <div className="card-frame-tight px-7 py-7">
                  <h3 className="font-display text-lg font-semibold text-fg">
                    Get in touch
                  </h3>
                  <p className="mt-2 text-sm text-fg-muted">
                    The fastest way to reach us is email. We staff support during
                    business hours across UTC-5 to UTC+5:30.
                  </p>
                  <ul className="mt-6 space-y-4">
                    <ContactRow
                      Icon={Mail}
                      label="Email"
                      value="hello@blockpay.dev"
                      href="mailto:hello@blockpay.dev"
                    />
                    <ContactRow
                      Icon={AtSign}
                      label="X / Twitter"
                      value="@blockpaydev"
                      href="https://x.com/blockpaydev"
                    />
                    <ContactRow
                      Icon={MessageCircle}
                      label="Discord"
                      value="discord.gg/blockpay"
                      href="#"
                    />
                  </ul>
                </div>

                <div className="card-frame-tight px-7 py-7">
                  <h3 className="font-display text-lg font-semibold text-fg">
                    For developers
                  </h3>
                  <p className="mt-2 text-sm text-fg-muted">
                    Stuck on an integration? Skip the form and ping us where
                    code already lives.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/docs" className="btn-pill text-xs">
                      Docs
                      <ChevronRight size={14} strokeWidth={2.4} />
                    </Link>
                    <a href="#" className="btn-pill text-xs">
                      GitHub
                      <ChevronRight size={14} strokeWidth={2.4} />
                    </a>
                  </div>
                </div>

                <div className="card-frame-tight px-7 py-7">
                  <h3 className="font-display text-lg font-semibold text-fg">
                    Sales hours
                  </h3>
                  <p className="mt-3 text-sm text-fg-muted">
                    Mon – Fri, 09:00 – 19:00 UTC. Demo calls bookable directly
                    from the form above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-[var(--border-active)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        className="group flex items-start gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-elev)]"
      >
        <span
          className="mt-[2px] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] text-accent"
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.16em] text-fg-subtle">
            {label}
          </span>
          <span className="text-sm text-fg group-hover:text-accent">
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}
