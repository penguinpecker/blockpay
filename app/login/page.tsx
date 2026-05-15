"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Mail, Wallet } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type FormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Nav active="Login" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-md px-6 pt-36 pb-12 text-center md:px-8 md:pt-40">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Merchant login
            </span>
            <h1 className="mx-auto mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              <span className="text-accent">Welcome</span> back
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-base text-zinc-400">
              Sign in to your BlockPay merchant dashboard to manage settlements,
              API keys, and storefront integrations.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-md">
            {submitted ? (
              <div className="card-frame p-7 text-center md:p-10">
                <span
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                  aria-hidden="true"
                >
                  <CheckCircle2 size={26} strokeWidth={2} />
                </span>
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  Magic link <span className="text-accent">sent</span>
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                  Check your email — we sent a sign-in link to{" "}
                  <span className="text-white">{form.email || "your inbox"}</span>.
                  It will expire in 15 minutes.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-pill text-sm"
                  >
                    Use a different email
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-frame p-7 md:p-10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="grid gap-5"
                >
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

                  <Field label="Password" htmlFor="password">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <button
                    type="submit"
                    className="btn-pill-solid mt-2 justify-center text-sm"
                  >
                    <Mail size={16} strokeWidth={2.2} />
                    Log in
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </form>

                <div className="my-7 flex items-center gap-4">
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    or
                  </span>
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                </div>

                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="btn-pill w-full justify-center text-sm"
                >
                  <Wallet size={16} strokeWidth={2.2} />
                  Continue with wallet
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  We&apos;ll route this through the BlockPay merchant dashboard
                  once you&apos;re approved.
                </p>

                <p className="mt-7 text-center text-sm text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Sign up
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
