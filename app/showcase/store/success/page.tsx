"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/showcase-store/cart-context";
import { findProduct, formatUsd } from "../_lib/catalog";

type Snapshot = {
  createdAt: number;
  totalUsd: string;
  invoiceId?: string;
  items: { slug: string; qty: number }[];
};

const STORAGE_KEY = "northwave.lastOrder.v1";

function shortTx(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessFallback() {
  return (
    <div className="nw-shell">
      <div className="nw-success-card">
        <div className="flex flex-col items-center text-center">
          <div className="nw-check-badge" aria-hidden="true">
            <CheckCircle2 size={28} strokeWidth={1.6} />
          </div>
          <h1 className="nw-italic-display mt-5 text-3xl">Loading your order…</h1>
        </div>
      </div>
    </div>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const txParam = params?.get("tx") ?? "";
  const invoiceParam = params?.get("invoice") ?? "";
  const { clear } = useCart();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Snapshot;
        if (parsed && Array.isArray(parsed.items)) {
          setSnapshot(parsed);
        }
      }
    } catch {
      // ignore corrupt snapshot
    }
    setHydrated(true);
  }, []);

  // Clear the live cart once we've shown the receipt. Keep the snapshot
  // in localStorage so a refresh of /success still shows the last order.
  useEffect(() => {
    if (!hydrated) return;
    if (!snapshot) return;
    clear();
    // intentionally only run when we first read the snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <div className="nw-shell">
      <div className="nw-success-card">
        <div className="flex flex-col items-center text-center">
          <div className="nw-check-badge" aria-hidden="true">
            <CheckCircle2 size={28} strokeWidth={1.6} />
          </div>
          <h1 className="nw-italic-display mt-5 text-3xl">Thanks for your order.</h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--nw-fg-muted)]">
            Your payment has been settled on-chain. A confirmation will
            normally go out by email — this is a demo storefront, so we'll
            keep it on this page instead.
          </p>
        </div>

        <div className="nw-success-meta">
          {invoiceParam || snapshot?.invoiceId ? (
            <div className="nw-success-meta-row">
              <span className="nw-success-meta-label">Invoice</span>
              <span className="nw-success-meta-value">
                {invoiceParam || snapshot?.invoiceId}
              </span>
            </div>
          ) : null}
          {txParam ? (
            <div className="nw-success-meta-row">
              <span className="nw-success-meta-label">Tx hash</span>
              <span className="nw-success-meta-value" title={txParam}>
                {shortTx(txParam)}
              </span>
            </div>
          ) : null}
          <div className="nw-success-meta-row">
            <span className="nw-success-meta-label">Chain</span>
            <span className="nw-success-meta-value">Arc testnet · USDC</span>
          </div>
          {snapshot ? (
            <div className="nw-success-meta-row">
              <span className="nw-success-meta-label">Total</span>
              <span className="nw-success-meta-value">
                {formatUsd(snapshot.totalUsd)} USDC
              </span>
            </div>
          ) : null}
        </div>

        {snapshot && snapshot.items.length > 0 ? (
          <div className="mt-6">
            <p className="nw-eyebrow">Order contents</p>
            <ul className="mt-3 divide-y divide-[var(--nw-border)] text-sm">
              {snapshot.items.map((item) => {
                const product = findProduct(item.slug);
                if (!product) return null;
                const unitCents = Math.round(Number(product.priceUsd) * 100);
                const lineUsd = ((unitCents * item.qty) / 100).toFixed(2);
                return (
                  <li
                    key={item.slug}
                    className="flex items-center justify-between py-2"
                  >
                    <span>
                      {product.name}
                      <span className="text-[var(--nw-fg-subtle)]">
                        {" "}
                        × {item.qty}
                      </span>
                    </span>
                    <span className="font-[var(--font-space-grotesk)] tabular-nums">
                      {formatUsd(lineUsd)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-[var(--nw-fg-muted)]">
            {hydrated
              ? "We couldn't find a recent order on this device. If you just paid, your invoice did settle — it's just not cached here."
              : "Loading order…"}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/showcase/store"
            className="nw-btn nw-btn-primary nw-btn-full"
          >
            Back to Northwave
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--nw-fg-subtle)]">
          Checkout secured by BlockPay. Demo storefront — no physical
          orders ship.
        </p>
      </div>
    </div>
  );
}
