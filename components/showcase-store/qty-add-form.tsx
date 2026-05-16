"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-context";

export function QtyAddForm({ slug }: { slug: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="nw-qty">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
        >
          <Minus size={14} strokeWidth={2} />
        </button>
        <span className="nw-qty-value" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => Math.min(99, q + 1))}
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>
      <button
        type="button"
        className="nw-btn nw-btn-accent"
        onClick={() => {
          add(slug, qty);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1200);
        }}
      >
        {added ? (
          <>
            <Check size={14} strokeWidth={2} />
            Added to cart
          </>
        ) : (
          <>
            <Plus size={14} strokeWidth={2} />
            Add to cart
          </>
        )}
      </button>
    </div>
  );
}
