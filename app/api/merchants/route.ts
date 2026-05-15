import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/merchants
 * Creates the merchant profile for the current authed user.
 * Idempotent: if a merchant already exists for this user, returns it.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    businessName?: string;
    email?: string;
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

  // If the user signed up via email, persist it too. The email may be in
  // session.user.email or in the request body for SIWE-only users.
  const email = body.email?.trim() || session.user.email || null;

  await prisma.user.update({
    where: { id: session.user.id as string },
    data: email ? { email: email.toLowerCase() } : {},
  });

  const apiKeyPlaintext = `bp_live_${crypto.randomBytes(20).toString("hex")}`;
  const apiKeyHash = crypto.createHash("sha256").update(apiKeyPlaintext).digest("hex");

  const merchant = await prisma.merchant.upsert({
    where: { userId: session.user.id as string },
    create: {
      userId: session.user.id as string,
      businessName,
      settlementAddress,
      settlementChainKey,
      settlementCurrency,
      volumeEstimate: body.volumeEstimate ?? null,
      apiKeyHash,
    },
    update: {
      businessName,
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id as string },
  });
  return NextResponse.json({ merchant });
}
