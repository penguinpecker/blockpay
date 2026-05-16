import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server-session";
import type { Merchant } from "@prisma/client";

/**
 * Server-only helper used by every dashboard page. Resolves the current
 * Privy session and the merchant profile that belongs to it, redirecting
 * to login or signup as appropriate so child pages can assume both exist.
 *
 * Re-exported from `components/dashboard/require-merchant.ts` for callers
 * that already imported the helper from there.
 */
export async function requireMerchant(fromPath: string = "/dashboard"): Promise<{
  userId: string;
  merchant: Merchant;
}> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?from=${encodeURIComponent(fromPath)}`);
  }
  const userId = session.userId;

  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });
  if (!merchant) {
    redirect("/onboarding");
  }

  return { userId, merchant };
}
