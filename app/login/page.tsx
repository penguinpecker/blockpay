"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  Wallet,
  Loader2,
  AlertTriangle,
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

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting"; via: "google" | "email" | "wallet" }
  | { kind: "magic-sent"; email: string }
  | { kind: "success" }
  | { kind: "error"; message: string };

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-[var(--border-active)]";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [methods, setMethods] = useState<AuthMethods | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("from") || "/dashboard";

  useEffect(() => {
    fetch("/api/auth/methods")
      .then((r) => r.json())
      .then((m: AuthMethods) => setMethods(m))
      .catch(() => setMethods({ google: false, email: false, demoEmail: true, wallet: true }));
  }, []);

  const busy = state.kind === "submitting";

  async function handleGoogle() {
    setState({ kind: "submitting", via: "google" });
    try {
      await signIn("google", { callbackUrl: next });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setState({ kind: "error", message: msg });
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setState({ kind: "error", message: "Enter a valid email." });
      return;
    }
    setState({ kind: "submitting", via: "email" });
    try {
      if (methods?.email) {
        const result = await signIn("resend", { email, redirect: false, callbackUrl: next });
        if (result?.error) {
          setState({ kind: "error", message: "Could not send sign-in email." });
          return;
        }
        setState({ kind: "magic-sent", email });
        return;
      }
      // Fallback: demo-email creates a user immediately (testnet only)
      const result = await signIn("demo-email", { email, redirect: false });
      if (result?.error) {
        setState({ kind: "error", message: "Sign-in failed. Try again." });
        return;
      }
      setState({ kind: "success" });
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setState({ kind: "error", message: msg });
    }
  }

  async function handleWallet() {
    if (typeof window === "undefined" || !window.ethereum) {
      setState({
        kind: "error",
        message: "No injected wallet. Install MetaMask or a compatible wallet.",
      });
      return;
    }
    setState({ kind: "submitting", via: "wallet" });
    try {
      const eth = window.ethereum as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts || accounts.length === 0) {
        setState({ kind: "error", message: "Wallet returned no account." });
        return;
      }
      // MetaMask returns lowercase; SIWE strict-validates EIP-55, so normalize.
      const address = getAddress(accounts[0] as `0x${string}`);
      const chainIdHex = (await eth.request({ method: "eth_chainId" })) as string;
      const chainId = parseInt(chainIdHex, 16);

      const nonceRes = await fetch("/api/auth/siwe-nonce");
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to BlockPay merchant dashboard.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
      });
      const prepared = message.prepareMessage();
      const signature = (await eth.request({
        method: "personal_sign",
        params: [prepared, address],
      })) as string;

      const result = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
      if (result?.error) {
        setState({ kind: "error", message: "SIWE verification failed." });
        return;
      }
      setState({ kind: "success" });
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message.split("\n")[0] : "Wallet sign-in failed";
      setState({ kind: "error", message: msg });
    }
  }

  return (
    <PaletteScope>
      <Nav active="Login" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-md px-6 pt-36 pb-12 text-center md:px-8 md:pt-40">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Merchant login
            </span>
            <h1
              className="mx-auto mt-6 font-display text-4xl font-bold leading-[1.05] text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-accent">Welcome</span> back
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-base text-fg-muted">
              Sign in to manage settlements, API keys, and storefront integrations.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-md">
            {state.kind === "magic-sent" ? (
              <SuccessCard
                title={<>Check your <span className="text-accent">email</span></>}
                body={
                  <>
                    We sent a sign-in link to{" "}
                    <span className="text-white">{state.email}</span>. It expires in 15 minutes.
                  </>
                }
                reset={() => setState({ kind: "idle" })}
              />
            ) : state.kind === "success" ? (
              <SuccessCard
                title={<>Signed <span className="text-accent">in</span></>}
                body={<>Routing you to the dashboard.</>}
              />
            ) : (
              <div className="card-frame p-7 md:p-10">
                {methods?.google && (
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={busy}
                    className="btn-pill w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {state.kind === "submitting" && state.via === "google" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                )}

                {methods?.google && (
                  <div className="my-6 flex items-center gap-4">
                    <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                    <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle">or</span>
                    <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                  </div>
                )}

                <form onSubmit={handleEmail} className="grid gap-4">
                  <label htmlFor="email" className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Email
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ada@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-pill-solid justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {state.kind === "submitting" && state.via === "email" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Mail size={16} strokeWidth={2.2} />
                    )}
                    {methods?.email
                      ? "Email me a sign-in link"
                      : methods?.demoEmail
                        ? "Continue with email (testnet)"
                        : "Continue with email"}
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                  {methods?.demoEmail && (
                    <p className="text-center text-[11px] text-fg-subtle">
                      Testnet demo: any email creates a session without verification.
                    </p>
                  )}
                </form>

                <div className="my-6 flex items-center gap-4">
                  <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle">or</span>
                  <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                </div>

                <button
                  type="button"
                  onClick={handleWallet}
                  disabled={busy}
                  className="btn-pill w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state.kind === "submitting" && state.via === "wallet" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wallet size={16} strokeWidth={2.2} />
                  )}
                  Continue with wallet
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
                <p className="mt-3 text-center text-[11px] text-fg-subtle">
                  Sign-In With Ethereum (EIP-4361). No password — your wallet signs a message.
                </p>

                {state.kind === "error" && (
                  <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
                    <AlertTriangle size={14} className="mt-[2px] shrink-0" />
                    <span>{state.message}</span>
                  </div>
                )}

                <p className="mt-7 text-center text-sm text-fg-muted">
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
    </PaletteScope>
  );
}

function SuccessCard({
  title,
  body,
  reset,
}: {
  title: React.ReactNode;
  body: React.ReactNode;
  reset?: () => void;
}) {
  return (
    <div className="card-frame p-7 text-center md:p-10">
      <span
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-active)] bg-[var(--bg-elev)] text-accent"
        aria-hidden="true"
      >
        <CheckCircle2 size={26} strokeWidth={2} />
      </span>
      <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-fg-muted">{body}</p>
      {reset && (
        <button
          type="button"
          onClick={reset}
          className="btn-pill mt-8 text-sm"
        >
          Use a different email
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="shrink-0"
    >
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
