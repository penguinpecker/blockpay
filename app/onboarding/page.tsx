"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
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

/**
 * /onboarding — Gated by Privy session. Collects the merchant business
 * profile (business name, industry, settlement wallet, settlement chain,
 * settlement currency, volume estimate) and POSTs to /api/merchants. On
 * success, surfaces the one-time API key and routes to /dashboard.
 *
 * Guard flow:
 *   - Privy not authenticated → redirect /signup
 *   - Already has a Merchant row → redirect /dashboard
 *   - Otherwise → render the form
 */

const industryOptions = [
  "SaaS / Software",
  "E-commerce / Physical goods",
  "Marketplace",
  "Digital services / Agency",
  "Subscriptions / Memberships",
  "Gaming / NFTs",
  "Creator / Content",
  "Donations / Nonprofit",
  "Other",
];

const volumeOptions = [
  "Just exploring",
  "$0-1K / month",
  "$1K-10K / month",
  "$10K-100K / month",
  "$100K+ / month",
];

const chainOptions: { value: string; label: string; disabled?: boolean }[] = [
  { value: "arc-testnet", label: "Arc Testnet" },
  { value: "arc", label: "Arc Mainnet — post-audit launch (M2)", disabled: true },
];

type FormState = {
  businessName: string;
  industry: string;
  wallet: string;
  chain: string;
  currency: "USDC" | "EURC";
  volume: string;
  agree: boolean;
};

const initialState: FormState = {
  businessName: "",
  industry: "",
  wallet: "",
  chain: "arc-testnet",
  currency: "USDC",
  volume: "",
  agree: false,
};

type SubmitState =
  | { kind: "checking" }
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; apiKey: string; merchantId: string }
  | { kind: "error"; message: string };

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [form, setForm] = useState<FormState>(initialState);
  const [state, setState] = useState<SubmitState>({ kind: "checking" });
  const [copied, setCopied] = useState(false);

  // Auth + existing-merchant guard. Runs once Privy is ready.
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.replace("/signup");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/merchants", { method: "GET" });
        if (cancelled) return;
        if (res.ok) {
          const data: { merchant?: { id: string } | null } = await res
            .json()
            .catch(() => ({}));
          if (data.merchant) {
            router.replace("/dashboard");
            return;
          }
        }
        setState({ kind: "idle" });
      } catch {
        if (!cancelled) setState({ kind: "idle" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, router]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!/^0x[a-fA-F0-9]{40}$/.test(form.wallet.trim())) {
        setState({
          kind: "error",
          message:
            "Settlement wallet address must be a 0x-prefixed 40-char hex string.",
        });
        return;
      }
      if (!authenticated) {
        setState({
          kind: "error",
          message: "Your session expired. Please sign in again.",
        });
        return;
      }
      setState({ kind: "submitting" });
      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch("/api/merchants", {
          method: "POST",
          headers,
          body: JSON.stringify({
            businessName: form.businessName,
            industry: form.industry,
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
            message: data.error
              ? `Failed: ${data.error}`
              : "Failed to create merchant.",
          });
          return;
        }
        setState({
          kind: "success",
          apiKey: data.apiKey,
          merchantId: data.merchant.id,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setState({ kind: "error", message: msg });
      }
    },
    [authenticated, form, getAccessToken],
  );

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
              Merchant onboarding
            </span>
            <h1
              className="mx-auto mt-6 font-display text-4xl font-bold leading-[1.05] text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Tell us about your <span className="text-accent">business</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base text-fg-muted">
              Where should we settle payments? You can change any of these
              later from the dashboard.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-xl">
            {state.kind === "checking" ? (
              <div className="card-frame flex items-center justify-center gap-3 p-12 text-sm text-fg-muted">
                <Loader2 size={16} className="animate-spin" />
                Checking your session
              </div>
            ) : state.kind === "success" ? (
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
                  Your merchant API key below. Save it now — it will not be
                  shown again.
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
                  Merchant profile
                </h2>
                <p className="mt-3 text-sm text-fg-muted">
                  Six quick fields and you&apos;re live.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
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

                  <Field label="Industry" htmlFor="industry">
                    <select
                      id="industry"
                      name="industry"
                      required
                      value={form.industry}
                      onChange={(e) => update("industry", e.target.value)}
                      className={`${inputCls} appearance-none pr-10`}
                      style={selectChevronStyle}
                    >
                      <option value="" disabled>
                        Select an industry
                      </option>
                      {industryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
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

                  <fieldset>
                    <legend className="mb-2 block text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Settlement chain
                    </legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {chainOptions.map((c) => {
                        const active = form.chain === c.value;
                        const disabled = Boolean(c.disabled);
                        return (
                          <label
                            key={c.value}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                              disabled
                                ? "cursor-not-allowed border-[var(--border)] bg-[var(--bg-card)] text-fg-subtle opacity-60"
                                : active
                                  ? "border-[var(--border-active)] bg-[var(--bg-elev)] text-fg"
                                  : "border-[var(--border)] bg-[var(--bg-card)] text-fg-muted hover:border-[var(--border-strong)]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                  active && !disabled
                                    ? "border-[var(--accent)]"
                                    : "border-[var(--fg-subtle)]"
                                }`}
                                aria-hidden="true"
                              >
                                {active && !disabled ? (
                                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                                ) : null}
                              </span>
                              <span className="font-medium">{c.label}</span>
                            </span>
                            <input
                              type="radio"
                              name="chain"
                              value={c.value}
                              checked={active}
                              disabled={disabled}
                              onChange={() =>
                                !disabled && update("chain", c.value)
                              }
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-fg-subtle">
                      Arc Mainnet unlocks after the M2 audit. Arc Testnet
                      accepts real on-chain test payments today.
                    </p>
                  </fieldset>

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
                    {state.kind === "submitting"
                      ? "Creating"
                      : "Create merchant account"}
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </form>
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
