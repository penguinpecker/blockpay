import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server-session";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/merchants
 * Creates the merchant profile for the current authed user.
 * Idempotent: if a merchant already exists for this user, returns it.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.userId;

  let body: {
    businessName?: string;
    email?: string;
    industry?: string;
    settlementAddress?: string;
    settlementChainKey?: string;
    settlementCurrency?: string;
    volumeEstimate?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const businessName = body.businessName?.trim();
  const industry = body.industry?.trim() || null;
  const settlementAddress = body.settlementAddress?.trim();
  const settlementChainKey = body.settlementChainKey?.trim();
  const settlementCurrency = body.settlementCurrency?.trim();

  if (!businessName || !settlementAddress || !settlementChainKey || !settlementCurrency) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(settlementAddress)) {
    return NextResponse.json({ error: "invalid_settlement_address" }, { status: 400 });
  }
  if (!["USDC", "EURC"].includes(settlementCurrency)) {
    return NextResponse.json({ error: "invalid_settlement_currency" }, { status: 400 });
  }

  // Persist email from the form when provided (Privy may also have
  // attached one during session sync — keep the most recent).
  const email = body.email?.trim() || session.user.email || null;

  await prisma.user.update({
    where: { id: userId },
    data: email ? { email: email.toLowerCase() } : {},
  });

  const apiKeyPlaintext = `bp_live_${crypto.randomBytes(20).toString("hex")}`;
  const apiKeyHash = crypto.createHash("sha256").update(apiKeyPlaintext).digest("hex");

  const merchant = await prisma.merchant.upsert({
    where: { userId },
    create: {
      userId,
      businessName,
      industry,
      settlementAddress,
      settlementChainKey,
      settlementCurrency,
      volumeEstimate: body.volumeEstimate ?? null,
      apiKeyHash,
    },
    update: {
      businessName,
      industry,
      settlementAddress,
      settlementChainKey,
      settlementCurrency,
      volumeEstimate: body.volumeEstimate ?? null,
    },
  });

  return NextResponse.json({
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      industry: merchant.industry,
      settlementAddress: merchant.settlementAddress,
      settlementChainKey: merchant.settlementChainKey,
      settlementCurrency: merchant.settlementCurrency,
    },
    apiKey: apiKeyPlaintext,
    apiKeyNote: "Save this key now. It will not be shown again.",
  });
}

/**
 * GET /api/merchants/me
 * Returns the authed user's merchant profile, or null.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json({ merchant });
}

/**
 * PATCH /api/merchants
 * Update mutable merchant fields for the authed user. Supports a subset of
 * fields used by the dashboard: businessName, settlementAddress,
 * settlementChainKey, settlementCurrency, webhookUrl. Also supports
 * `regenerateApiKey: true` which mints a fresh plaintext key and returns it
 * once.
 */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.userId;

  let body: {
    businessName?: string;
    industry?: string | null;
    settlementAddress?: string;
    settlementChainKey?: string;
    settlementCurrency?: string;
    webhookUrl?: string | null;
    regenerateApiKey?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const existing = await prisma.merchant.findUnique({
    where: { userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "no_merchant" }, { status: 404 });
  }

  const data: {
    businessName?: string;
    industry?: string | null;
    settlementAddress?: string;
    settlementChainKey?: string;
    settlementCurrency?: string;
    webhookUrl?: string | null;
    apiKeyHash?: string;
    webhookSecret?: string;
  } = {};

  if (typeof body.businessName === "string" && body.businessName.trim()) {
    data.businessName = body.businessName.trim();
  }
  if (body.industry === null) {
    data.industry = null;
  } else if (typeof body.industry === "string") {
    const trimmed = body.industry.trim();
    data.industry = trimmed === "" ? null : trimmed;
  }
  if (typeof body.settlementAddress === "string") {
    const addr = body.settlementAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      return NextResponse.json(
        { error: "invalid_settlement_address" },
        { status: 400 },
      );
    }
    data.settlementAddress = addr;
  }
  if (typeof body.settlementChainKey === "string" && body.settlementChainKey.trim()) {
    data.settlementChainKey = body.settlementChainKey.trim();
  }
  if (typeof body.settlementCurrency === "string") {
    if (!["USDC", "EURC"].includes(body.settlementCurrency)) {
      return NextResponse.json(
        { error: "invalid_settlement_currency" },
        { status: 400 },
      );
    }
    data.settlementCurrency = body.settlementCurrency;
  }
  if (body.webhookUrl === null) {
    data.webhookUrl = null;
  } else if (typeof body.webhookUrl === "string") {
    const trimmed = body.webhookUrl.trim();
    if (trimmed === "") {
      data.webhookUrl = null;
    } else {
      try {
        const u = new URL(trimmed);
        if (u.protocol !== "https:" && u.protocol !== "http:") {
          throw new Error("bad protocol");
        }
        data.webhookUrl = trimmed;
        if (!existing.webhookSecret) {
          data.webhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
        }
      } catch {
        return NextResponse.json(
          { error: "invalid_webhook_url" },
          { status: 400 },
        );
      }
    }
  }

  let plaintextApiKey: string | null = null;
  if (body.regenerateApiKey) {
    plaintextApiKey = `bp_live_${crypto.randomBytes(20).toString("hex")}`;
    data.apiKeyHash = crypto
      .createHash("sha256")
      .update(plaintextApiKey)
      .digest("hex");
  }

  const updated = await prisma.merchant.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({
    merchant: {
      id: updated.id,
      businessName: updated.businessName,
      industry: updated.industry,
      settlementAddress: updated.settlementAddress,
      settlementChainKey: updated.settlementChainKey,
      settlementCurrency: updated.settlementCurrency,
      webhookUrl: updated.webhookUrl,
      apiKeyIssued: updated.apiKeyHash !== null,
    },
    apiKey: plaintextApiKey,
    apiKeyNote: plaintextApiKey
      ? "Save this key now. It will not be shown again."
      : null,
  });
}
