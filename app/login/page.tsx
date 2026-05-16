"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

/**
 * Login surface. Privy owns the actual provider selection (email,
 * Google, every wallet type) — we just trigger its modal and react
 * to the result. After a successful login we POST to
 * /api/auth/privy/sync so the local User row is created/refreshed,
 * then redirect to the dashboard (or `?from=` if present).
 */

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("from") || "/dashboard";
  const { ready, authenticated, getAccessToken } = usePrivy();

  const finalizeLogin = useCallback(async () => {
    setState({ kind: "submitting" });
    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/auth/privy/sync", {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({
          kind: "error",
          message: data?.error ? `Sync failed: ${data.error}` : "Could not finalize sign-in.",
        });
        return;
      }
      setState({ kind: "success" });
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setState({ kind: "error", message: msg });
    }
  }, [getAccessToken, next, router]);

  const { login } = useLogin({
    onComplete: () => {
      void finalizeLogin();
    },
    onError: (err) => {
      // Privy emits a PrivyErrorCode string (e.g. "exited_auth_flow"
      // when the user dismisses the modal). Treat that as not-an-error.
      const message = typeof err === "string" ? err : "Sign-in failed";
      if (message === "exited_auth_flow") {
        setState({ kind: "idle" });
        return;
      }
      setState({ kind: "error", message });
    },
  });

  // If the user is already authenticated when they land here (e.g. they
  // refreshed the page), run the sync + redirect automatically.
  useEffect(() => {
    if (ready && authenticated && state.kind === "idle") {
      void finalizeLogin();
    }
  }, [ready, authenticated, state.kind, finalizeLogin]);

  const busy = state.kind === "submitting" || !ready;

  function handleSignIn() {
    if (!ready) return;
    setState({ kind: "idle" });
    login();
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
            {state.kind === "success" ? (
              <SuccessCard
                title={<>Signed <span className="text-accent">in</span></>}
                body={<>Routing you to the dashboard.</>}
              />
            ) : (
              <div className="card-frame p-7 md:p-10">
                <p className="mb-6 text-center text-sm text-fg-muted">
                  Sign in with email, Google, or a wallet. We&apos;ll handle the rest.
                </p>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={busy}
                  className="btn-pill-solid w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogIn size={16} strokeWidth={2.2} />
                  )}
                  Sign in
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>

                <p className="mt-4 text-center text-[11px] text-fg-subtle">
                  Email magic link, Google OAuth, or any Web3 wallet —
                  picked inside the next dialog.
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
}: {
  title: React.ReactNode;
  body: React.ReactNode;
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
    </div>
  );
}
