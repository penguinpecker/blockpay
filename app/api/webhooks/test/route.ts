/**
 * POST /api/webhooks/test
 *
 * Developer convenience: fire a `webhook.test` event to the caller's
 * configured `webhookUrl`. Returns the delivery result so merchants can
 * verify their receiver is reachable and validating signatures
 * correctly.
 *
 * Auth: dual mode. Either an Auth.js session OR a Bearer API key.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Merchant } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ApiKeyAuthError,
  optionalMerchantFromApiKey,
} from "@/lib/server-auth";
import { deliverWebhook } from "@/lib/server-webhooks";

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

export async function POST(req: NextRequest) {
  const merchant = await resolveCallerMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!merchant.webhookUrl) {
    return NextResponse.json(
      { error: "no_webhook_url_configured" },
      { status: 400 },
    );
  }

  const result = await deliverWebhook({
    merchant,
    event: "webhook.test",
    data: { message: "Hello from BlockPay" },
  });

  return NextResponse.json({
    webhookUrl: merchant.webhookUrl,
    delivery: result,
  });
}
