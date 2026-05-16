/**
 * GET  /api/invoices          List invoices (scoped to caller's merchant)
 * POST /api/invoices          Create an invoice (scoped to caller's merchant)
 *
 * Auth: dual mode. Either an Auth.js session OR a Bearer API key. POST
 * always settles to the authenticated merchant's `settlementAddress` —
 * callers cannot override the destination by sending `merchantAddress`
 * in the body (that field is ignored).
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Merchant } from "@prisma/client";
import { getSession } from "@/lib/server-session";
import { CHAINS, type ChainKey } from "@/lib/contracts";
import { prisma } from "@/lib/prisma";
import {
  ApiKeyAuthError,
  optionalMerchantFromApiKey,
} from "@/lib/server-auth";
import { deliverWebhook } from "@/lib/server-webhooks";
import {
  storage,
  type InvoiceStatus,
  type LineItem,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS: InvoiceStatus[] = [
  "draft",
  "open",
  "paid",
  "expired",
  "void",
];

function isAddress(v: unknown): v is `0x${string}` {
  return typeof v === "string" && /^0x[0-9a-fA-F]{40}$/.test(v);
}

function isAmount(v: unknown): v is string {
  return typeof v === "string" && /^\d+$/.test(v) && v.length <= 78;
}

function isChainKey(v: unknown): v is ChainKey {
  return typeof v === "string" && v in CHAINS;
}

function isCurrency(v: unknown): v is "USDC" | "EURC" {
  return v === "USDC" || v === "EURC";
}

function isLineItem(v: unknown): v is LineItem {
  if (!v || typeof v !== "object") return false;
  const o = v as { label?: unknown; amount?: unknown };
  return typeof o.label === "string" && typeof o.amount === "string";
}

function isHexBytes32(v: unknown): v is `0x${string}` {
  return typeof v === "string" && /^0x[0-9a-fA-F]{64}$/.test(v);
}

/**
 * Resolve the caller's Merchant via either a Bearer API key or an
 * Auth.js session. Returns null if neither yields a merchant.
 */
async function resolveCallerMerchant(
  req: NextRequest,
): Promise<Merchant | null> {
  try {
    const fromKey = await optionalMerchantFromApiKey(req);
    if (fromKey) return fromKey.merchant;
  } catch (err) {
    if (err instanceof ApiKeyAuthError) {
      // optional helper shouldn't throw, but be defensive
      return null;
    }
    throw err;
  }

  const session = await getSession();
  if (!session) return null;
  return prisma.merchant.findUnique({
    where: { userId: session.userId },
  });
}

export async function GET(req: NextRequest) {
  const merchant = await resolveCallerMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl;
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && (VALID_STATUS as string[]).includes(statusParam)
      ? (statusParam as InvoiceStatus)
      : undefined;

  // Always scope to the caller's merchant — ignore any `merchantId`
  // query param so one merchant cannot list another's invoices.
  const invoices = await storage.invoices.list({
    merchantId: merchant.id,
    status,
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const merchant = await resolveCallerMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  // `merchantId` and `merchantAddress` from the body are intentionally
  // ignored. The settlement address always comes from the authenticated
  // merchant so a caller cannot redirect funds elsewhere.
  if (!isAmount(b.amount)) {
    return NextResponse.json(
      { error: "invalid_field", field: "amount" },
      { status: 400 },
    );
  }
  if (!isCurrency(b.currency)) {
    return NextResponse.json(
      { error: "invalid_field", field: "currency" },
      { status: 400 },
    );
  }
  if (!isChainKey(b.chainKey)) {
    return NextResponse.json(
      { error: "invalid_field", field: "chainKey" },
      { status: 400 },
    );
  }
  if (!Array.isArray(b.lineItems) || !b.lineItems.every(isLineItem)) {
    return NextResponse.json(
      { error: "invalid_field", field: "lineItems" },
      { status: 400 },
    );
  }
  if (b.memoCid !== undefined && !isHexBytes32(b.memoCid)) {
    return NextResponse.json(
      { error: "invalid_field", field: "memoCid" },
      { status: 400 },
    );
  }
  if (
    b.expiresAt !== undefined &&
    (typeof b.expiresAt !== "number" || !Number.isFinite(b.expiresAt))
  ) {
    return NextResponse.json(
      { error: "invalid_field", field: "expiresAt" },
      { status: 400 },
    );
  }

  if (!isAddress(merchant.settlementAddress)) {
    // Shouldn't happen — settlementAddress is validated at signup — but
    // if a corrupt row leaks through, refuse rather than create a bad invoice.
    return NextResponse.json(
      { error: "invalid_merchant_settlement_address" },
      { status: 500 },
    );
  }

  const invoice = await storage.invoices.create({
    merchantId: merchant.id,
    merchantAddress: merchant.settlementAddress,
    amount: b.amount,
    currency: b.currency,
    chainKey: b.chainKey,
    lineItems: b.lineItems as LineItem[],
    memoCid: b.memoCid as `0x${string}` | undefined,
    expiresAt: b.expiresAt as number | undefined,
  });

  // Fire `invoice.created` webhook best-effort. We don't await failure
  // (the result is logged but never blocks invoice creation).
  void deliverWebhook({
    merchant,
    event: "invoice.created",
    data: invoice,
  }).then((res) => {
    if (!res.delivered && res.error) {
      console.warn("[webhook] invoice.created delivery failed", {
        merchantId: merchant.id,
        invoiceId: invoice.id,
        error: res.error,
      });
    }
  });

  return NextResponse.json(
    {
      id: invoice.id,
      onChainInvoiceId: invoice.onChainInvoiceId,
      checkoutUrl: `/checkout/${invoice.id}`,
      invoice,
    },
    { status: 201 },
  );
}
