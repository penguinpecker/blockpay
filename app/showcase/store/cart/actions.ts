"use server";

/**
 * Northwave Goods → BlockPay invoice handoff.
 *
 * Server action invoked from the cart page's "Checkout with BlockPay"
 * button. Creates (or reuses) the demo Northwave Merchant, mints a fresh
 * BlockPay Invoice via Prisma directly, and returns the invoice id so
 * the client can navigate to /checkout/<id>.
 *
 * We talk to the storage layer rather than the public /api/invoices
 * route on purpose: this demo storefront does not have an API key in
 * env, and we don't want the demo to depend on an authenticated session.
 * Going through `storage.invoices.create` keeps merchant resolution
 * consistent with the rest of BlockPay.
 */

import { prisma } from "@/lib/prisma";
import { storage, type LineItem } from "@/lib/storage";
import {
  CATALOG,
  findProduct,
  usdToUsdcBaseUnits,
  formatUsd,
} from "../_lib/catalog";

const DEMO_USER_EMAIL = "demo@northwave.example";
const DEMO_MERCHANT_NAME = "Northwave Goods";
const DEMO_SETTLEMENT_ADDRESS = "0x9D6D4CbD170Ea0CeabcAD69f16917669Dfa11e14";
const DEMO_CHAIN_KEY = "arc-testnet";
const DEMO_CURRENCY = "USDC";
const DEMO_INDUSTRY = "E-commerce / Physical goods";

export type CheckoutInput = {
  items: { slug: string; qty: number }[];
};

export type CheckoutResult =
  | { ok: true; invoiceId: string; amountUsdcBaseUnits: string; totalUsd: string }
  | { ok: false; error: string };

/**
 * Idempotently ensure a "Northwave Goods" demo User + Merchant exist.
 * Safe to call on every checkout — uses upsert under the hood.
 */
async function getOrCreateDemoMerchant() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: { email: DEMO_USER_EMAIL, name: DEMO_MERCHANT_NAME },
    update: {},
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      businessName: DEMO_MERCHANT_NAME,
      industry: DEMO_INDUSTRY,
      settlementAddress: DEMO_SETTLEMENT_ADDRESS.toLowerCase(),
      settlementChainKey: DEMO_CHAIN_KEY,
      settlementCurrency: DEMO_CURRENCY,
    },
    update: {
      businessName: DEMO_MERCHANT_NAME,
      industry: DEMO_INDUSTRY,
      settlementAddress: DEMO_SETTLEMENT_ADDRESS.toLowerCase(),
      settlementChainKey: DEMO_CHAIN_KEY,
      settlementCurrency: DEMO_CURRENCY,
    },
  });

  return merchant;
}

/**
 * Convert a cart payload to BlockPay's `LineItem[]` shape.
 * `amount` strings are written as dollar-and-cents text ("$48.00 × 2 = $96.00")
 * so a human reading the invoice sees something readable.
 */
function buildLineItems(items: { slug: string; qty: number }[]): {
  lines: LineItem[];
  totalUsd: string;
} {
  const lines: LineItem[] = [];
  let totalCents = 0;
  for (const item of items) {
    const product = findProduct(item.slug);
    if (!product) continue;
    const unitCents = Math.round(Number(product.priceUsd) * 100);
    const lineCents = unitCents * item.qty;
    totalCents += lineCents;
    lines.push({
      label:
        item.qty > 1 ? `${product.name} (x${item.qty})` : product.name,
      amount: formatUsd((lineCents / 100).toFixed(2)),
    });
  }
  const totalUsd = (totalCents / 100).toFixed(2);
  return { lines, totalUsd };
}

export async function createNorthwaveInvoice(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // Re-validate each line server-side. Never trust the client's price.
  const validSlugs = new Set(CATALOG.map((p) => p.slug));
  const cleaned: { slug: string; qty: number }[] = [];
  for (const raw of input.items) {
    if (!raw || typeof raw !== "object") continue;
    if (typeof raw.slug !== "string" || !validSlugs.has(raw.slug)) continue;
    const qty = Math.min(99, Math.max(1, Math.floor(Number(raw.qty) || 0)));
    if (qty <= 0) continue;
    cleaned.push({ slug: raw.slug, qty });
  }
  if (cleaned.length === 0) {
    return { ok: false, error: "No valid items in cart." };
  }

  try {
    await getOrCreateDemoMerchant();

    const { lines, totalUsd } = buildLineItems(cleaned);
    const amountBaseUnits = usdToUsdcBaseUnits(totalUsd);

    const invoice = await storage.invoices.create({
      merchantId: "", // ignored — storage resolves merchant by address
      merchantAddress: DEMO_SETTLEMENT_ADDRESS.toLowerCase() as `0x${string}`,
      amount: amountBaseUnits,
      currency: "USDC",
      chainKey: "arc-testnet",
      lineItems: lines,
    });

    return {
      ok: true,
      invoiceId: invoice.id,
      amountUsdcBaseUnits: amountBaseUnits,
      totalUsd,
    };
  } catch (err) {
    console.error("[northwave] createNorthwaveInvoice failed", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to create checkout. Please try again.",
    };
  }
}
