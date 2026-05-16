"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/showcase-store/cart-context";
import { ProductArt } from "../_lib/illustrations";
import { formatUsd } from "../_lib/catalog";
import { createNorthwaveInvoice } from "./actions";

export default function CartPage() {
  const { lines, items, ready, setQty, remove, subtotalLabel, subtotalUsd, itemCount } =
    useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Don't flash an "empty cart" state until localStorage has hydrated.
  if (!ready) {
    return (
      <div className="nw-shell">
        <div className="nw-empty">
          <p>Loading your cart…</p>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="nw-shell">
        <div className="nw-empty">
          <ShoppingBag size={28} strokeWidth={1.4} />
          <h1 className="nw-empty-title mt-4">Your cart is empty.</h1>
          <p className="mt-2">Pick something out from the catalog.</p>
          <div className="mt-6 flex justify-center">
            <Link href="/showcase/store" className="nw-btn nw-btn-primary">
              Browse the catalog
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onCheckout = () => {
    setError(null);
    startTransition(async () => {
      try {
        // Persist a "last order" snapshot so the success page can show
        // the line items even though it doesn't have invoice DB access.
        const snapshot = {
          createdAt: Date.now(),
          totalUsd: subtotalUsd,
          items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "northwave.lastOrder.v1",
            JSON.stringify(snapshot),
          );
        }

        const result = await createNorthwaveInvoice({ items });
        if (!result.ok) {
          setError(result.error);
          return;
        }

        // Tag the invoice id on the snapshot so the success page can
        // surface it after the user returns.
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "northwave.lastOrder.v1",
            JSON.stringify({ ...snapshot, invoiceId: result.invoiceId }),
          );
        }

        // Hand off to BlockPay's checkout. The return_url query param
        // is informational — BlockPay's existing success page links
        // back to / by default; users can also reach
        // /showcase/store/success directly via the Order status link
        // in the Northwave top bar (which reads the snapshot above).
        const returnUrl = "/showcase/store/success";
        router.push(
          `/checkout/${result.invoiceId}?return_url=${encodeURIComponent(returnUrl)}`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong creating the invoice.",
        );
      }
    });
  };

  return (
    <div className="nw-shell">
      <div className="pt-12">
        <p className="nw-eyebrow">Cart</p>
        <h1 className="nw-italic-display mt-2 text-4xl">Your order</h1>
      </div>

      <section className="nw-cart-page">
        <div>
          {lines.map((line) => (
            <article key={line.slug} className="nw-cart-row">
              <Link
                href={`/showcase/store/product/${line.slug}`}
                className="nw-cart-row-art"
                aria-label={`View ${line.name}`}
              >
                <ProductArt slug={line.slug} />
              </Link>
              <div>
                <div className="nw-cart-row-name">{line.name}</div>
                <div className="nw-cart-row-meta">
                  {formatUsd(line.unitPriceUsd)} each
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="nw-qty">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${line.name}`}
                      onClick={() => setQty(line.slug, line.qty - 1)}
                      disabled={line.qty <= 1}
                    >
                      <Minus size={14} strokeWidth={2} />
                    </button>
                    <span className="nw-qty-value">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.name}`}
                      onClick={() => setQty(line.slug, line.qty + 1)}
                    >
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="nw-cart-row-remove"
                    onClick={() => remove(line.slug)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="nw-cart-row-price">
                {formatUsd(line.lineTotalUsd)}
              </div>
            </article>
          ))}
        </div>

        <aside className="nw-summary">
          <h2 className="nw-eyebrow">Order summary</h2>
          <div className="mt-4">
            <div className="nw-summary-row">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="nw-summary-row">
              <span>Shipping</span>
              <span>Calculated at handoff</span>
            </div>
            <div className="nw-summary-total">
              <span>Total</span>
              <span>{subtotalLabel} USDC</span>
            </div>
          </div>

          <button
            type="button"
            className="nw-btn nw-btn-accent nw-btn-full mt-6"
            onClick={onCheckout}
            disabled={pending}
          >
            {pending ? "Preparing checkout…" : "Checkout with BlockPay"}
            {!pending ? <ArrowRight size={14} strokeWidth={2} /> : null}
          </button>

          {error ? (
            <p className="mt-3 text-xs text-[var(--nw-accent-deep)]">{error}</p>
          ) : null}

          <p className="nw-summary-note">
            You'll be handed off to BlockPay to pay in USDC on Arc testnet.
            BlockPay does not custody funds — payment settles straight to
            Northwave's wallet.
          </p>
        </aside>
      </section>
    </div>
  );
}
