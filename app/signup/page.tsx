"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  ChevronRight,
  AlertTriangle,
  Loader2,
  LogIn,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

/**
 * Signup landing. Pure Privy auth + a short pitch — no merchant profile
 * form. After a successful Privy login we:
 *   1. POST /api/auth/privy/sync to upsert the local User row
 *   2. GET /api/merchants to see if this user already has a merchant
 *   3. Redirect to /dashboard (existing merchant) or /onboarding (new).
 */

type Phase =
  | { kind: "idle" }
  | { kind: "syncing" }
  | { kind: "routing" }
  | { kind: "error"; message: string };

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  const finalize = useCallback(async () => {
    setPhase({ kind: "syncing" });
    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const syncRes = await fetch("/api/auth/privy/sync", {
        method: "POST",
        headers,
      });
      if (!syncRes.ok) {
        const data = await syncRes.json().catch(() => ({}));
        setPhase({
          kind: "error",
          message: data?.error
            ? `Sync failed: ${data.error}`
            : "Could not finalize sign-in.",
        });
        return;
      }

      setPhase({ kind: "routing" });
      const meRes = await fetch("/api/merchants", { method: "GET" });
      if (meRes.ok) {
        const data: { merchant?: { id: string } | null } = await meRes
          .json()
          .catch(() => ({}));
        if (data.merchant) {
          router.push("/dashboard");
          return;
        }
      }
      router.push("/onboarding");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-up failed";
      setPhase({ kind: "error", message: msg });
    }
  }, [getAccessToken, router]);

  const { login } = useLogin({
    onComplete: () => {
      void finalize();
    },
    onError: (err) => {
      const message = typeof err === "string" ? err : "Sign-up failed";
      if (message === "exited_auth_flow") {
        setPhase({ kind: "idle" });
        return;
      }
      setPhase({ kind: "error", message });
    },
  });

  // If the user is already authenticated when they land here, run the
  // sync + redirect automatically.
  useEffect(() => {
    if (ready && authenticated && phase.kind === "idle") {
      void finalize();
    }
  }, [ready, authenticated, phase.kind, finalize]);

  const busy =
    !ready || phase.kind === "syncing" || phase.kind === "routing";

  function handleSignUp() {
    if (!ready) return;
    setPhase({ kind: "idle" });
    login();
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
              chargebacks. Create an account in seconds — we&apos;ll collect
              your settlement details on the next step.
            </p>
          </div>
        </section>

        <section className="px-6 pb-28 md:px-8">
          <div className="mx-auto max-w-md">
            <div className="card-frame p-7 md:p-10">
              <p className="mb-6 text-center text-sm text-fg-muted">
                Sign up with email, Google, or a wallet. We&apos;ll handle the
                rest.
              </p>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={busy}
                className="btn-pill-solid w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} strokeWidth={2.2} />
                )}
                {phase.kind === "syncing"
                  ? "Finalizing account"
                  : phase.kind === "routing"
                    ? "Routing"
                    : "Sign up"}
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>

              <p className="mt-4 text-center text-[11px] text-fg-subtle">
                Email magic link, Google OAuth, or any Web3 wallet — picked
                inside the next dialog.
              </p>

              {phase.kind === "error" && (
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
                  <AlertTriangle size={14} className="mt-[2px] shrink-0" />
                  <span>{phase.message}</span>
                </div>
              )}

              <p className="mt-7 text-center text-sm text-fg-muted">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}
