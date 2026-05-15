/**
 * POST /api/webhooks/circle
 *
 * Receives Circle webhook callbacks. Verifies the HMAC-SHA256 signature
 * carried in the `Circle-Webhook-Signature` header against the shared
 * secret configured via `CIRCLE_WEBHOOK_SECRET`. Replies 200 on success,
 * 401 on signature failure, 400 on malformed body. Body parsing only
 * inspects the `notificationType` field; full handling will be wired
 * once each event type is mapped to a domain action.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Header may arrive lowercase or uppercase; normalize.
  const provided = signature.trim().toLowerCase();
  const expectedHex = expected.toLowerCase();
  if (provided.length !== expectedHex.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf8"),
      Buffer.from(expectedHex, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CIRCLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "circle_webhook_not_configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("circle-webhook-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 401 });
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: { notificationType?: unknown } = {};
  try {
    payload = JSON.parse(rawBody) as { notificationType?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const notificationType =
    typeof payload.notificationType === "string"
      ? payload.notificationType
      : "unknown";

  // Log only the event type; never the full body which may contain
  // wallet ids, addresses, or other sensitive context.
  // eslint-disable-next-line no-console
  console.log(`[circle.webhook] notificationType=${notificationType}`);

  return NextResponse.json({ ok: true });
}
