"use client";

/**
 * Northwave Goods cart state.
 *
 * Pure client-side cart backed by localStorage so it survives page nav.
 * This is intentionally NOT shared with the rest of BlockPay — it lives
 * under components/showcase-store/ and only wraps the /showcase/store/*
 * tree via app/showcase/store/layout.tsx.
 *
 * Stored shape: { slug, qty }[]. Line items + totals are derived from the
 * static catalog at render time, so changing prices in catalog.ts
 * automatically reprices anything already in the cart.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CATALOG, findProduct, formatUsd } from "@/app/showcase/store/_lib/catalog";

export type CartItem = {
  slug: string;
  qty: number;
};

export type DerivedLine = {
  slug: string;
  name: string;
  qty: number;
  unitPriceUsd: string;
  lineTotalUsd: string;
};

export type CartState = {
  items: CartItem[];
  lines: DerivedLine[];
  itemCount: number;
  subtotalUsd: string;
  subtotalLabel: string;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "northwave.cart.v1";

const CartCtx = createContext<CartState | null>(null);

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const validSlugs = new Set(CATALOG.map((p) => p.slug));
    return parsed
      .filter(
        (x): x is CartItem =>
          !!x &&
          typeof x === "object" &&
          typeof (x as CartItem).slug === "string" &&
          typeof (x as CartItem).qty === "number" &&
          (x as CartItem).qty > 0 &&
          validSlugs.has((x as CartItem).slug),
      )
      .map((x) => ({ slug: x.slug, qty: Math.min(99, Math.max(1, Math.floor(x.qty))) }));
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore — storage may be unavailable in private modes
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Start empty on the server so SSR markup matches first client paint.
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  // Persist on every change (skip the first SSR-hydration write).
  useEffect(() => {
    if (!ready) return;
    writeStorage(items);
  }, [items, ready]);

  const add = useCallback((slug: string, qty: number = 1) => {
    if (!findProduct(slug)) return;
    setItems((prev) => {
      const existing = prev.find((x) => x.slug === slug);
      if (existing) {
        return prev.map((x) =>
          x.slug === slug ? { ...x, qty: Math.min(99, x.qty + qty) } : x,
        );
      }
      return [...prev, { slug, qty: Math.min(99, Math.max(1, qty)) }];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((x) => x.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((x) => x.slug !== slug));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.slug === slug ? { ...x, qty: Math.min(99, Math.floor(qty)) } : x)),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const derived = useMemo(() => {
    const lines: DerivedLine[] = [];
    let subtotalCents = 0;
    let count = 0;
    for (const item of items) {
      const p = findProduct(item.slug);
      if (!p) continue;
      const unitCents = Math.round(Number(p.priceUsd) * 100);
      const lineCents = unitCents * item.qty;
      subtotalCents += lineCents;
      count += item.qty;
      lines.push({
        slug: p.slug,
        name: p.name,
        qty: item.qty,
        unitPriceUsd: p.priceUsd,
        lineTotalUsd: (lineCents / 100).toFixed(2),
      });
    }
    const subtotalUsd = (subtotalCents / 100).toFixed(2);
    return {
      lines,
      itemCount: count,
      subtotalUsd,
      subtotalLabel: formatUsd(subtotalUsd),
    };
  }, [items]);

  const value: CartState = {
    items,
    add,
    remove,
    setQty,
    clear,
    ready,
    ...derived,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartCtx);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
