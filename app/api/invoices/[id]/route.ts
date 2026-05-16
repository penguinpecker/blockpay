/**
 * GET /api/invoices/[id]  Fetch a single invoice (scoped to caller's merchant)
 *
 * Auth: dual mode. Either an Auth.js session OR a Bearer API key. If the
 * invoice does not belong to the caller's merchant we return 404 (not
 * 403) to avoid leaking which invoice ids exist on other merchants.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Merchant } from "@prisma/client";
import { getSession } from "@/lib/server-session";
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

  const session = await getSession();
  if (!session) return null;
  return prisma.merchant.findUnique({
    where: { userId: session.userId },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const merchant = await resolveCallerMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await storage.invoices.get(id);
  if (!invoice || invoice.merchantId !== merchant.id) {
    // Mask the "exists but belongs to someone else" case as 404.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}
