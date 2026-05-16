/**
 * Outgoing webhook delivery for BlockPay.
 *
 * When a merchant configures a `webhookUrl` (and `webhookSecret`) on
 * their Merchant row, we POST signed JSON to that URL for events of
 * interest — new payments, invoice state transitions, etc.
 *
 * Signature scheme (Stripe-style):
 *   - Compute HMAC-SHA256 over `${ts}.${rawBody}` using `webhookSecret`.
 *   - Send as `X-BlockPay-Signature: t=${ts},v1=${hex}` so receivers can
 *     timestamp-check before verifying.
 *   - `ts` is seconds since epoch, matching the `ts` field in the body.
 *
 * All deliveries are best-effort: callers should not `await` failure or
 * let webhook errors block business logic. We also enforce a 5s timeout
 * so a slow receiver can't stall the indexer.
 */
import crypto from "node:crypto";
import type { Merchant } from "@prisma/client";

export type WebhookEvent =
  | "invoice.created"
  | "invoice.paid"
  | "invoice.expired"
  | "payment.received"
  | "webhook.test";

export type WebhookDeliveryResult = {
  delivered: boolean;
  status?: number;
  error?: string;
};

const FETCH_TIMEOUT_MS = 5000;

/**
 * POST a signed JSON payload to the merchant's configured webhook URL.
 * Returns a result object; never throws.
 */
export async function deliverWebhook(args: {
  merchant: Merchant;
  event: WebhookEvent;
  data: unknown;
}): Promise<WebhookDeliveryResult> {
  const { merchant, event, data } = args;

  if (!merchant.webhookUrl) {
    return { delivered: false };
  }
  if (!merchant.webhookSecret) {
    // Configured a URL but never persisted a signing secret. Treat as a
    // configuration error rather than sending an unsigned payload.
    return { delivered: false, error: "missing_webhook_secret" };
  }

  const id = crypto.randomUUID();
  const ts = Math.floor(Date.now() / 1000);
  const payload = { id, ts, event, data };
  const rawBody = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", merchant.webhookSecret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(merchant.webhookUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-BlockPay-Signature": `t=${ts},v1=${signature}`,
        "X-BlockPay-Event": event,
        "X-BlockPay-Delivery": id,
      },
      body: rawBody,
    });
    return {
      delivered: res.ok,
      status: res.status,
      ...(res.ok ? {} : { error: `http_${res.status}` }),
    };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message
        : "unknown_error";
    return { delivered: false, error: reason };
  } finally {
    clearTimeout(timer);
  }
}
