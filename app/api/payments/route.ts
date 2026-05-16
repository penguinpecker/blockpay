/**
 * GET /api/payments  List recorded on-chain payments (scoped to caller)
 *
 * Auth: dual mode. Either an Auth.js session OR a Bearer API key. We
 * always scope to the caller's merchant — `merchantId` query params are
 * ignored to prevent enumerating other merchants' payments.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Merchant } from "@prisma/client";
import { auth } from "@/auth";
import { CHAINS, type ChainKey } from "@/lib/contracts";
import { prisma } from "@/lib/prisma";
import {
  ApiKeyAuthError,
  optionalMerchantFromApiKey,
} from "@/lib/server-auth";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveCallerMerchant(
  req: NextRequest,
): Promise<Merchant | null> {
  try {
    const fromKey = await optionalMerchantFromApiKey(req);
    if (fromKey) return fromKey.merchant;
  } catch (err) {
    if (err instanceof ApiKeyAuthError) return null;
    throw err;
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.merchant.findUnique({
    where: { userId: userId as string },
  });
}

export async function GET(req: NextRequest) {
  const merchant = await resolveCallerMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl;
  const chainKeyParam = url.searchParams.get("chainKey");
  const chainKey =
    chainKeyParam && chainKeyParam in CHAINS
      ? (chainKeyParam as ChainKey)
      : undefined;

  const payments = await storage.payments.list({
    merchantId: merchant.id,
    chainKey,
  });
  return NextResponse.json({ payments });
}
