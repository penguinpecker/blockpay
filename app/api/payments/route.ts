/**
 * GET /api/payments  List recorded on-chain payments
 */

import { NextResponse, type NextRequest } from "next/server";
import { CHAINS, type ChainKey } from "@/lib/contracts";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const merchantId = url.searchParams.get("merchantId") ?? undefined;
  const chainKeyParam = url.searchParams.get("chainKey");
  const chainKey =
    chainKeyParam && chainKeyParam in CHAINS
      ? (chainKeyParam as ChainKey)
      : undefined;

  const payments = await storage.payments.list({ merchantId, chainKey });
  return NextResponse.json({ payments });
}
