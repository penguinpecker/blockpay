import "server-only";
import { PrivyClient, type AuthTokenClaims } from "@privy-io/server-auth";

/**
 * Server-side Privy client. Constructed from PRIVY_APP_ID +
 * PRIVY_APP_SECRET (never exposed to the browser). Used to verify
 * Privy access tokens and fetch user details (linked email, wallet,
 * etc.) when we upsert our own User row.
 *
 * The PrivyProvider on the client (components/privy-provider.tsx)
 * issues the cookie that this verifier reads.
 */

const appId = process.env.PRIVY_APP_ID;
const appSecret = process.env.PRIVY_APP_SECRET;

if (!appId || !appSecret) {
  // Don't throw at import time — the build steps over server files
  // even when env vars aren't set. We surface a clearer error the
  // first time something actually calls the client.
  console.warn(
    "[privy] PRIVY_APP_ID / PRIVY_APP_SECRET missing; auth will fail at runtime.",
  );
}

export const privy = new PrivyClient(appId ?? "", appSecret ?? "");

/**
 * Verify a Privy access token. Returns the verified claims on
 * success, or `null` on any failure (expired, malformed, signed by
 * a different app, etc.) — callers should treat `null` as "no
 * session" rather than crashing.
 */
export async function verifyPrivyToken(
  token: string,
): Promise<AuthTokenClaims | null> {
  if (!token) return null;
  try {
    return await privy.verifyAuthToken(token);
  } catch {
    return null;
  }
}
