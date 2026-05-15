"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const volumeOptions = [
  "Just exploring",
  "$0-1K / month",
  "$1K-10K / month",
  "$10K-100K / month",
  "$100K+ / month",
];

const chainOptions = [
  { value: "arc-testnet", label: "Arc Testnet" },
  { value: "base-sepolia", label: "Base Sepolia" },
];

type FormState = {
  businessName: string;
  email: string;
  wallet: string;
  chain: string;
  currency: "USDC" | "EURC";
  volume: string;
  agree: boolean;
};

const initialState: FormState = {
  businessName: "",
  email: "",
  wallet: "",
  chain: "",
  currency: "USDC",
  volume: "",
  agree: false,
};

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Nav active="Signup" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-xl px-6 pt-36 pb-12 text-center md:px-8 md:pt-40">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Merchant signup
            </span>
            <h1 className="mx-auto mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Start accepting <span className="text-accent">stablecoin</span>{" "}
              payments
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base text-zinc-400">
              One-click integration, instant settlement to your wallet, and zero
              chargebacks. Tell us where to send funds and we&apos;ll have you
              live in minutes.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-xl">
            {submitted ? (
              <div className="card-frame p-8 text-center md:p-12">
                <span
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                  aria-hidden="true"
                >
                  <CheckCircle2 size={26} strokeWidth={2} />
                </span>
                <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                  Account request <span className="text-accent">received</span>
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm text-zinc-400">
                  We will reach out within 24 hours to finalize your onboarding
                  and provision API keys for your settlement chain.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/" className="btn-pill text-sm">
                    Back to home
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-frame p-7 md:p-10">
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  Create your <span className="text-accent">merchant</span>{" "}
                  account
                </h2>
                <p className="mt-3 text-sm text-zinc-400">
                  Four quick fields. You can edit any of this later from the
                  dashboard.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="mt-8 grid gap-5"
                >
                  <Field label="Business name" htmlFor="businessName">
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      autoComplete="organization"
                      placeholder="Analytical Engines Ltd."
                      value={form.businessName}
                      onChange={(e) => update("businessName", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Email" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ada@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field
                    label="Settlement wallet address"
                    htmlFor="wallet"
                  >
                    <input
                      id="wallet"
                      name="wallet"
                      type="text"
                      required
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="0x..."
                      value={form.wallet}
                      onChange={(e) => update("wallet", e.target.value)}
                      className={`${inputCls} font-mono`}
                    />
                  </Field>

                  <Field label="Settlement chain" htmlFor="chain">
                    <select
                      id="chain"
                      name="chain"
                      required
                      value={form.chain}
                      onChange={(e) => update("chain", e.target.value)}
                      className={`${inputCls} appearance-none pr-10`}
                      style={selectChevronStyle}
                    >
                      <option value="" disabled>
                        Arc Mainnet (Summer 2026)
                      </option>
                      {chainOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <fieldset>
                    <legend className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Default settlement currency
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(["USDC", "EURC"] as const).map((c) => {
                        const active = form.currency === c;
                        return (
                          <label
                            key={c}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                              active
                                ? "border-[rgba(74,222,128,0.6)] bg-[rgba(74,222,128,0.08)] text-white"
                                : "border-[rgba(74,222,128,0.22)] bg-[rgba(8,14,10,0.7)] text-zinc-300 hover:border-[rgba(74,222,128,0.4)]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                  active
                                    ? "border-[#4ade80]"
                                    : "border-zinc-500"
                                }`}
                                aria-hidden="true"
                              >
                                {active ? (
                                  <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                                ) : null}
                              </span>
                              <span className="font-medium">{c}</span>
                            </span>
                            <input
                              type="radio"
                              name="currency"
                              value={c}
                              checked={active}
                              onChange={() => update("currency", c)}
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Field label="Volume estimate" htmlFor="volume">
                    <select
                      id="volume"
                      name="volume"
                      required
                      value={form.volume}
                      onChange={(e) => update("volume", e.target.value)}
                      className={`${inputCls} appearance-none pr-10`}
                      style={selectChevronStyle}
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

                  <label className="mt-1 flex items-start gap-3 text-sm text-zinc-400">
                    <input
                      type="checkbox"
                      required
                      checked={form.agree}
                      onChange={(e) => update("agree", e.target.checked)}
                      className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-[rgba(74,222,128,0.4)] bg-[rgba(8,14,10,0.7)] checked:border-[#4ade80] checked:bg-[#4ade80]"
                      style={{
                        backgroundImage: form.agree
                          ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M2.5 6.5 L5 9 L9.5 3.5' stroke='%23052e16' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")"
                          : undefined,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="btn-pill-solid mt-3 justify-center text-sm"
                  >
                    Create merchant account
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-[rgba(74,222,128,0.22)] bg-[rgba(8,14,10,0.7)] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-[rgba(74,222,128,0.6)]";

const selectChevronStyle: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M3 4.5 L6 7.5 L9 4.5' stroke='%234ade80' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

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
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
