import { generateNonce } from "siwe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/auth/siwe-nonce
 * Returns a fresh SIWE nonce for the client to embed in the message.
 * The nonce is round-tripped through the message; we don't store it
 * server-side. (For replay-resistance beyond a single tx, layer a DB
 * nonce table; sufficient for signing-only auth like this.)
 */
export async function GET() {
  return NextResponse.json({ nonce: generateNonce() });
}
