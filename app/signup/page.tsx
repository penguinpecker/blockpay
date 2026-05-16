"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type AuthMethods = {
  google: boolean;
  email: boolean;
  demoEmail: boolean;
  wallet: boolean;
};

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path
        fill="#FFFFFF"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64Z"
      />
      <path
        fill="#FFFFFF"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.55-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.92v2.34A8.99 8.99 0 0 0 9 18Z"
      />
      <path
        fill="#FFFFFF"
        d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.94H.92A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.92 4.06l3.05-2.34Z"
      />
      <path
        fill="#FFFFFF"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A8.99 8.99 0 0 0 9 0 8.99 8.99 0 0 0 .92 4.94l3.05 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

const volumeOptions = [
  "Just exploring",
  "$0-1K / month",
  "$1K-10K / month",
  "$10K-100K / month",
  "$100K+ / month",
];

/**
 * Chain options for settlement. Mainnet chains are listed first but disabled
 * — the Router contract deploys to mainnet after the M2 audit. Testnet
 * preview chains are currently the only ones that can accept live (test)
 * payments end-to-end.
 */
const chainGroups: {
  label: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}[] = [
  {
    label: "Mainnet — post-audit launch (M2)",
    hint: "Unlocks after the smart-contract audit closes. Currently disabled.",
    options: [
      { value: "base", label: "Base", disabled: true },
      { value: "arbitrum", label: "Arbitrum One", disabled: true },
      { value: "optimism", label: "Optimism", disabled: true },
      { value: "polygon", label: "Polygon", disabled: true },
      { value: "ethereum", label: "Ethereum", disabled: true },
      { value: "arc", label: "Arc Mainnet (Summer 2026)", disabled: true },
    ],
  },
  {
    label: "Testnet preview — accept on-chain test payments now",
    options: [
      { value: "base-sepolia", label: "Base Sepolia" },
      { value: "arc-testnet", label: "Arc Testnet" },
    ],
  },
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

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; apiKey: string; merchantId: string }
  | { kind: "error"; message: string };

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const [methods, setMethods] = useState<AuthMethods | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const submitted = state.kind === "success";

  useEffect(() => {
    fetch("/api/auth/methods")
      .then((r) => r.json())
      .then((m: AuthMethods) => setMethods(m))
      .catch(() => setMethods({ google: false, email: false, demoEmail: true, wallet: true }));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGoogleSignup() {
    setGoogleBusy(true);
    try {
      await signIn("google", { callbackUrl: "/signup" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setState({ kind: "error", message: msg });
      setGoogleBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Client-side address sanity check — gives a clear error before
    // the server's regex would (and matches the user's perception that
    // "the form" rejected it, not "the API").
    if (!/^0x[a-fA-F0-9]{40}$/.test(form.wallet.trim())) {
      setState({
        kind: "error",
        message: "Settlement wallet address must be a 0x-prefixed 40-char hex string.",
      });
      return;
    }
    setState({ kind: "submitting" });
    try {
      // 1. Sign in. If real email magic-link is configured, use it; otherwise
      //    fall back to the testnet demo-email provider that creates a user
      //    immediately. Google users are already authed via the button above
      //    so they skip this step (signIn for resend will fail gracefully).
      const providerId = methods?.email ? "resend" : "demo-email";
      const signInResult = await signIn(providerId, {
        email: form.email,
        redirect: false,
      });
      if (signInResult?.error) {
        setState({
          kind: "error",
          message: "Could not create session. Try Google sign-up at the top, or check your email config.",
        });
        return;
      }
      // 2. Create the merchant profile + receive an API key.
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          email: form.email,
          settlementAddress: form.wallet,
          settlementChainKey: form.chain,
          settlementCurrency: form.currency,
          volumeEstimate: form.volume,
        }),
      });
      const data: {
        error?: string;
        apiKey?: string;
        merchant?: { id: string };
      } = await res.json();
      if (!res.ok || !data.apiKey || !data.merchant) {
        setState({
          kind: "error",
          message: data.error ? `Failed: ${data.error}` : "Failed to create merchant.",
        });
        return;
      }
      setState({ kind: "success", apiKey: data.apiKey, merchantId: data.merchant.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setState({ kind: "error", message: msg });
    }
  }

  async function copyKey() {
    if (state.kind !== "success") return;
    try {
      await navigator.clipboard.writeText(state.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — user can select + copy manually
    }
  }

  return (
    <PaletteScope>
      <Nav active="Signup" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-xl px-6 pt-36 pb-12 text-center md:px-8 md:pt-40">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Merchant signup
            </span>
            <h1
              className="mx-auto mt-6 font-display text-4xl font-bold leading-[1.05] text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Start accepting <span className="text-accent">stablecoin</span>{" "}
              payments
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base text-fg-muted">
              One-click integration, instant settlement to your wallet, and zero
              chargebacks. Tell us where to send funds and we&apos;ll have you
              live in minutes.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-xl">
            {submitted && state.kind === "success" ? (
              <div className="card-frame p-8 text-center md:p-12">
                <span
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-active)] bg-[var(--bg-elev)] text-accent"
                  aria-hidden="true"
                >
                  <CheckCircle2 size={26} strokeWidth={2} />
                </span>
                <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-fg">
                  Account <span className="text-accent">created</span>
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm text-fg-muted">
                  Your merchant API key below. Save it now — it will not be shown again.
                </p>
                <div className="mt-6 rounded-2xl border border-[var(--border-active)] bg-[var(--bg-elev)] px-4 py-3 text-left">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                    BlockPay API key
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="break-all font-mono text-sm text-accent">
                      {state.apiKey}
                    </code>
                    <button
                      type="button"
                      onClick={copyKey}
                      className="shrink-0 rounded-full border border-[var(--border-strong)] p-2 text-accent transition-colors hover:bg-[var(--bg-card)]"
                      aria-label="Copy API key"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/dashboard" className="btn-pill-solid text-sm">
                    Go to dashboard
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </Link>
                  <Link href="/" className="btn-pill text-sm">
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-frame p-7 md:p-10">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
                  Create your merchant account
                </h2>
                <p className="mt-3 text-sm text-fg-muted">
                  Four quick fields. You can edit any of this later from the
                  dashboard.
                </p>

                {methods?.google && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={googleBusy}
                      className="btn-pill mt-6 w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {googleBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      Continue with Google
                      <ChevronRight size={16} strokeWidth={2.4} />
                    </button>
                    <div className="my-6 flex items-center gap-4">
                      <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                      <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
                        or fill in below
                      </span>
                      <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                    </div>
                  </>
                )}

                <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
                        Select a chain
                      </option>
                      {chainGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((c) => (
                            <option
                              key={c.value}
                              value={c.value}
                              disabled={c.disabled}
                            >
                              {c.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <p className="mt-2 text-[11px] text-fg-subtle">
                      Mainnet chains unlock after the M2 audit. Testnet preview
                      chains accept real on-chain test payments today.
                    </p>
                  </Field>

                  <fieldset>
                    <legend className="mb-2 block text-xs uppercase tracking-[0.16em] text-fg-subtle">
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
                                ? "border-[var(--border-active)] bg-[var(--bg-elev)] text-fg"
                                : "border-[var(--border)] bg-[var(--bg-card)] text-fg-muted hover:border-[var(--border-strong)]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                  active
                                    ? "border-[var(--accent)]"
                                    : "border-[var(--fg-subtle)]"
                                }`}
                                aria-hidden="true"
                              >
                                {active ? (
                                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
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

                  <label className="mt-1 flex items-start gap-3 text-sm text-fg-muted">
                    <input
                      type="checkbox"
                      required
                      checked={form.agree}
                      onChange={(e) => update("agree", e.target.checked)}
                      className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] checked:border-[var(--accent)] checked:bg-[var(--accent)]"
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

                  {state.kind === "error" && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
                      <AlertTriangle size={14} className="mt-[2px] shrink-0" />
                      <span>{state.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={state.kind === "submitting"}
                    className="btn-pill-solid mt-3 justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {state.kind === "submitting" ? "Creating…" : "Create merchant account"}
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-fg-muted">
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
    </PaletteScope>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-[var(--border-active)]";

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
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </span>
      {children}
    </label>
  );
}
