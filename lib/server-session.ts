import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { privy, verifyPrivyToken } from "@/lib/privy";

/**
 * Server-side session helper that replaces NextAuth's `auth()`.
 *
 * Source of truth is the `privy-token` cookie (issued by
 * @privy-io/react-auth on the client when a user signs in). The
 * helper verifies the token via the Privy server SDK, fetches the
 * canonical Privy user record (for email + wallet), and upserts a
 * local `User` row keyed on `privyDid` so the rest of the app keeps
 * its existing relational shape (Merchant.userId, etc.).
 *
 * Note: every render path that calls `getSession()` is already a
 * server component or route handler — the upsert is cheap and idempotent.
 */

export type Session = {
  userId: string;
  privyDid: string;
  user: User;
};

const PRIVY_COOKIE = "privy-token";

async function readPrivyTokenFromCookie(): Promise<string | null> {
  const jar = await cookies();
  const c = jar.get(PRIVY_COOKIE);
  return c?.value ?? null;
}

/**
 * Resolve the current session. Returns null when no valid Privy
 * token is present. Callers that need to redirect on absence
 * should use `requireSession` instead.
 */
export async function getSession(): Promise<Session | null> {
  const token = await readPrivyTokenFromCookie();
  if (!token) return null;

  const claims = await verifyPrivyToken(token);
  if (!claims?.userId) return null;

  const privyDid = claims.userId;

  // Look up the Privy user to pull email + wallet. If this fails
  // (network blip, etc.), still proceed with the DID alone — the
  // local User row will exist and the session is valid.
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
    // Fall through with whatever we have — the upsert below will
    // still keyword on the DID.
  }

  const user = await prisma.user.upsert({
    where: { privyDid },
    create: {
      privyDid,
      email: email ?? undefined,
      walletAddress: walletAddress ?? undefined,
    },
    update: {
      // Only overwrite fields when Privy has a value. Don't clobber
      // a previously-set email with null when Privy returns nothing.
      ...(email ? { email } : {}),
      ...(walletAddress ? { walletAddress } : {}),
    },
  });

  return { userId: user.id, privyDid, user };
}

/**
 * Like `getSession` but redirects to /login if the caller is not
 * authenticated. Use in server components or route handlers that
 * must have a session — child code can assume the return value is
 * truthy.
 */
export async function requireSession(redirectTo = "/dashboard"): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?from=${encodeURIComponent(redirectTo)}`);
  }
  return session;
}
