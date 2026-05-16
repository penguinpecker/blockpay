"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";

export function NorthwaveTopBar() {
  const { itemCount, ready } = useCart();
  // Render a stable count of 0 during SSR + first paint to avoid hydration
  // mismatch — the real value swaps in once `ready` flips true.
  const display = ready ? itemCount : 0;

  return (
    <header className="nw-topbar">
      <div className="nw-shell flex items-center justify-between py-5">
        <Link
          href="/showcase/store"
          className="nw-wordmark"
          aria-label="Northwave Goods — home"
        >
          <span className="nw-wordmark-glyph" aria-hidden="true">
            N
          </span>
          <span className="nw-wordmark-text">Northwave</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--nw-fg-muted)] md:flex">
          <Link href="/showcase/store" className="nw-link">
            Shop
          </Link>
          <Link href="/showcase/store/success" className="nw-link">
            Order status
          </Link>
        </nav>

        <Link
          href="/showcase/store/cart"
          className="nw-cart-button"
          aria-label={`Cart with ${display} item${display === 1 ? "" : "s"}`}
        >
          <ShoppingBag size={18} strokeWidth={1.6} />
          <span className="nw-cart-count" data-empty={display === 0}>
            {display}
          </span>
        </Link>
      </div>
    </header>
  );
}
