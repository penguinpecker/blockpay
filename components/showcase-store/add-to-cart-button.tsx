"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "./cart-context";

type Variant = "ghost" | "primary" | "accent";

export function AddToCartButton({
  slug,
  qty = 1,
  variant = "ghost",
  label = "Add to cart",
  full = false,
}: {
  slug: string;
  qty?: number;
  variant?: Variant;
  label?: string;
  full?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const cls = [
    "nw-btn",
    variant === "primary" ? "nw-btn-primary" : "",
    variant === "ghost" ? "nw-btn-ghost" : "",
    variant === "accent" ? "nw-btn-accent" : "",
    full ? "nw-btn-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        add(slug, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1100);
      }}
      aria-live="polite"
    >
      {added ? (
        <>
          <Check size={14} strokeWidth={2} />
          Added
        </>
      ) : (
        <>
          <Plus size={14} strokeWidth={2} />
          {label}
        </>
      )}
    </button>
  );
}
