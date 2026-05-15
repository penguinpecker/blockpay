/**
 * GET  /api/invoices          List invoices (filter by merchantId, status)
 * POST /api/invoices          Create an invoice
 */

import { NextResponse, type NextRequest } from "next/server";
import { CHAINS, type ChainKey } from "@/lib/contracts";
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

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const merchantId = url.searchParams.get("merchantId") ?? undefined;
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && (VALID_STATUS as string[]).includes(statusParam)
      ? (statusParam as InvoiceStatus)
      : undefined;

  const invoices = await storage.invoices.list({ merchantId, status });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
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

  if (typeof b.merchantId !== "string" || b.merchantId.length === 0) {
    return NextResponse.json(
      { error: "invalid_field", field: "merchantId" },
      { status: 400 },
    );
  }
  if (!isAddress(b.merchantAddress)) {
    return NextResponse.json(
      { error: "invalid_field", field: "merchantAddress" },
      { status: 400 },
    );
  }
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

  const invoice = await storage.invoices.create({
    merchantId: b.merchantId,
    merchantAddress: b.merchantAddress,
    amount: b.amount,
    currency: b.currency,
    chainKey: b.chainKey,
    lineItems: b.lineItems as LineItem[],
    memoCid: b.memoCid as `0x${string}` | undefined,
    expiresAt: b.expiresAt as number | undefined,
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
