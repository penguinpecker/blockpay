"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
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

type FormState = {
  email: string;
  password: string;
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "wallet" }
  | { kind: "success" }
  | { kind: "error"; message: string };

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("from") || "/dashboard";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "submitting" });
    try {
      const result = await signIn("demo-email", {
        email: form.email,
        redirect: false,
      });
      if (result?.error) {
        setState({ kind: "error", message: "Sign-in failed. Try again." });
        return;
      }
      setState({ kind: "success" });
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
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
    setState({ kind: "wallet" });
    try {
      const eth = window.ethereum as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts || accounts.length === 0) {
        setState({ kind: "error", message: "Wallet returned no account." });
        return;
      }
      const address = accounts[0];
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
      const msg =
        err instanceof Error ? err.message.split("\n")[0] : "Wallet sign-in failed";
      setState({ kind: "error", message: msg });
    }
  }

  const submitted = state.kind === "success";
  const busy = state.kind === "submitting" || state.kind === "wallet";

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
                  Signed <span className="text-accent">in</span>
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                  Routing you to the dashboard.
                </p>
              </div>
            ) : (
              <div className="card-frame p-7 md:p-10">
                <form onSubmit={handleEmailSubmit} className="grid gap-5">
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
                      autoComplete="current-password"
                      placeholder="(any value during the testnet demo)"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-pill-solid mt-2 justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {state.kind === "submitting" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Mail size={16} strokeWidth={2.2} />
                    )}
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
                  onClick={handleWallet}
                  disabled={busy}
                  className="btn-pill w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state.kind === "wallet" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wallet size={16} strokeWidth={2.2} />
                  )}
                  Continue with wallet
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  Sign-In With Ethereum (EIP-4361). No password — your wallet signs a message.
                </p>

                {state.kind === "error" && (
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
                    <AlertTriangle size={14} className="mt-[2px] shrink-0" />
                    <span>{state.message}</span>
                  </div>
                )}

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
