/**
 * POST /api/payment-links   Create a payment link for the authed merchant
 * GET  /api/payment-links   List the authed merchant's payment links
 *
 * Slugs are short (8 url-safe characters). On the rare chance of a collision
 * we retry up to MAX_SLUG_RETRIES before giving up.
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { getSession } from "@/lib/server-session";
import { prisma } from "@/lib/prisma";
import { CHAINS, type ChainKey } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SLUG_RETRIES = 5;
const SLUG_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function randomSlug(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

function isChainKey(v: unknown): v is ChainKey {
  return typeof v === "string" && v in CHAINS;
}

function isCurrency(v: unknown): v is "USDC" | "EURC" {
  return v === "USDC" || v === "EURC";
}

function isBaseAmount(v: unknown): v is string {
  return (
    typeof v === "string" && /^\d+$/.test(v) && v.length > 0 && v.length <= 30
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.userId },
  });
  if (!merchant) {
    return NextResponse.json({ error: "no_merchant" }, { status: 404 });
  }
  const links = await prisma.paymentLink.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.userId },
  });
  if (!merchant) {
    return NextResponse.json({ error: "no_merchant" }, { status: 404 });
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

  const label = typeof b.label === "string" ? b.label.trim() : "";
  if (!label) {
    return NextResponse.json(
      { error: "invalid_field", field: "label" },
      { status: 400 },
    );
  }
  if (!isBaseAmount(b.amount)) {
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
  const description =
    typeof b.description === "string" && b.description.trim()
      ? b.description.trim().slice(0, 280)
      : null;

  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const slug = randomSlug();
    const existing = await prisma.paymentLink.findUnique({ where: { slug } });
    if (existing) continue;
    try {
      const link = await prisma.paymentLink.create({
        data: {
          merchantId: merchant.id,
          slug,
          label,
          amount: b.amount,
          currency: b.currency,
          chainKey: b.chainKey,
          description,
        },
      });
      return NextResponse.json({ link }, { status: 201 });
    } catch (err) {
      lastError = err;
      // unique violation on slug — try again
    }
  }

  console.error("payment-links: failed to allocate slug", lastError);
  return NextResponse.json(
    { error: "slug_allocation_failed" },
    { status: 500 },
  );
}
