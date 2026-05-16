/**
 * Server-side API key authentication for BlockPay.
 *
 * Merchants get a single API key when their merchant profile is created
 * (see `app/api/merchants/route.ts`). We persist `sha256(key)` on the
 * Merchant row (`apiKeyHash`) so the plaintext is never stored — the
 * caller sends the plaintext as a Bearer token and we hash it on receipt.
 *
 * Two helpers are exported:
 *  - `requireMerchantFromApiKey` — throws `ApiKeyAuthError` on missing /
 *    invalid keys. The route handler converts the error into a 401.
 *  - `optionalMerchantFromApiKey` — returns `null` instead of throwing;
 *    useful for endpoints that accept either API key or session auth.
 */
import crypto from "node:crypto";
import type { Merchant } from "@prisma/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export class ApiKeyAuthError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus = 401) {
    super(message);
    this.name = "ApiKeyAuthError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

/**
 * Pull the Bearer token out of the Authorization header. Returns null if
 * the header is missing or doesn't follow the `Bearer <token>` format.
 */
function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

function hashKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Resolve a Merchant from a Bearer API key. Throws on missing or invalid
 * keys; the route handler should catch `ApiKeyAuthError` and turn it into
 * a 401 response with `{ error: err.code }`.
 */
export async function requireMerchantFromApiKey(
  req: NextRequest,
): Promise<{ merchant: Merchant }> {
  const token = extractBearer(req);
  if (!token) {
    throw new ApiKeyAuthError("missing_api_key", "Authorization header missing");
  }

  const apiKeyHash = hashKey(token);
  const merchant = await prisma.merchant.findUnique({ where: { apiKeyHash } });
  if (!merchant) {
    throw new ApiKeyAuthError("invalid_api_key", "Invalid API key");
  }
  return { merchant };
}

/**
 * Same as `requireMerchantFromApiKey` but returns null on missing /
 * invalid keys instead of throwing. Use in dual-auth handlers that also
 * accept a session.
 */
export async function optionalMerchantFromApiKey(
  req: NextRequest,
): Promise<{ merchant: Merchant } | null> {
  const token = extractBearer(req);
  if (!token) return null;
  const apiKeyHash = hashKey(token);
  const merchant = await prisma.merchant.findUnique({ where: { apiKeyHash } });
  if (!merchant) return null;
  return { merchant };
}
