/**
 * POST /api/auth/privy/sync
 *
 * Idempotent upsert of a local User row from a verified Privy
 * session. The client calls this immediately after a successful
 * Privy login so that downstream APIs (which key off the local
 * `users.id`) can find the row.
 *
 * Token resolution order:
 *  1. `Authorization: Bearer <token>` header (set explicitly by
 *     the client when it has the access token in JS).
 *  2. `privy-token` cookie (set by the Privy SDK).
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { privy, verifyPrivyToken } from "@/lib/privy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header) {
    const m = /^Bearer\s+(.+)$/i.exec(header.trim());
    if (m) return m[1].trim();
  }
  return req.cookies.get("privy-token")?.value ?? null;
}

export async function POST(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  const claims = await verifyPrivyToken(token);
  if (!claims?.userId) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  const privyDid = claims.userId;

  let email: string | null = null;
  let walletAddress: string | null = null;
  try {
    const pUser = await privy.getUserById(privyDid);
    if (pUser.email?.address) {
      email = pUser.email.address.toLowerCase();
    } else if (pUser.google?.email) {
      email = pUser.google.email.toLowerCase();
    }
    if (pUser.wallet?.address) {
      walletAddress = pUser.wallet.address.toLowerCase();
    }
  } catch {
    // Continue with whatever we have — the DID alone is enough to upsert.
  }

  const user = await prisma.user.upsert({
    where: { privyDid },
    create: {
      privyDid,
      email: email ?? undefined,
      walletAddress: walletAddress ?? undefined,
    },
    update: {
      ...(email ? { email } : {}),
      ...(walletAddress ? { walletAddress } : {}),
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
    },
  });
}
