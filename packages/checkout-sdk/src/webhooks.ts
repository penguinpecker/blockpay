import type { WebhookEvent } from "./types.js";

export type { WebhookEvent };

/** Input for `webhooks.verify()`. */
export interface VerifyWebhookInput {
  /** Raw request body, exactly as received (no JSON re-stringify). */
  rawBody: string;
  /** Value of the `X-Blockpay-Signature` header. */
  signature: string;
  /** Per-endpoint signing secret. */
  secret: string;
}

/** Input for `webhooks.parse()`. */
export interface ParseWebhookInput<T = unknown> {
  rawBody: string;
  /**
   * If provided, also verify the signature in the same call.
   * Either both `signature` and `secret` must be supplied, or neither.
   */
  signature?: string;
  secret?: string;
  /** Optional, narrows the returned `data` type. */
  _typed?: T;
}

/**
 * Lazily try to require `node:crypto` so this module still loads in
 * browsers, where it falls back to `crypto.subtle`.
 */
async function importNodeCrypto(): Promise<
  typeof import("node:crypto") | null
> {
  try {
    const mod = await import("node:crypto");
    return mod;
  } catch {
    return null;
  }
}

/** Hex-encode an ArrayBuffer / Uint8Array. */
function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes =
    buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

/** Convert a hex (or `sha256=hex`) signature to lowercased hex. */
function normaliseSignature(sig: string): string {
  const trimmed = sig.trim();
  const stripped = trimmed.startsWith("sha256=")
    ? trimmed.slice("sha256=".length)
    : trimmed;
  return stripped.toLowerCase();
}

/**
 * Constant-time string compare on equal-length hex strings.
 * Falls back to a manual XOR if `crypto.timingSafeEqual` is unavailable.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify and parse webhook deliveries from BlockPay.
 *
 * Use `verify()` on the raw request body and `X-Blockpay-Signature`
 * header. Always pass the body *exactly as received* — re-serialising
 * via JSON.parse → JSON.stringify will change byte ordering and break
 * the HMAC check.
 */
export class WebhooksModule {
  /**
   * Synchronous-style verify. Internally awaits the async hash via a
   * blocking promise resolution; for true sync usage the Node-only
   * `verifySync()` helper is preferred when `node:crypto` is present.
   */
  async verify(input: VerifyWebhookInput): Promise<boolean> {
    if (!input.rawBody) return false;
    if (!input.signature) return false;
    if (!input.secret) return false;

    const expected = normaliseSignature(input.signature);

    // Prefer node:crypto for a sync, audited HMAC implementation.
    const nodeCrypto = await importNodeCrypto();
    if (nodeCrypto && typeof nodeCrypto.createHmac === "function") {
      const computed = nodeCrypto
        .createHmac("sha256", input.secret)
        .update(input.rawBody, "utf8")
        .digest("hex");
      if (computed.length !== expected.length) return false;
      try {
        return nodeCrypto.timingSafeEqual(
          Buffer.from(computed, "hex"),
          Buffer.from(expected, "hex"),
        );
      } catch {
        return timingSafeEqualHex(computed, expected);
      }
    }

    // Browser / edge runtimes: use WebCrypto Subtle.
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      throw new Error(
        "No usable crypto implementation found (need node:crypto or crypto.subtle)",
      );
    }
    const enc = new TextEncoder();
    const key = await subtle.importKey(
      "raw",
      enc.encode(input.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await subtle.sign("HMAC", key, enc.encode(input.rawBody));
    const computed = toHex(sigBuf);
    return timingSafeEqualHex(computed, expected);
  }

  /**
   * Parse a webhook payload into a typed `{ event, data }` envelope.
   *
   * If `signature` and `secret` are provided, the HMAC is also verified
   * and a failed check throws.
   */
  async parse<T = unknown>(
    input: ParseWebhookInput<T>,
  ): Promise<WebhookEvent<T>> {
    if (input.signature !== undefined || input.secret !== undefined) {
      if (!input.signature || !input.secret) {
        throw new Error(
          "Both signature and secret must be provided to verify on parse",
        );
      }
      const ok = await this.verify({
        rawBody: input.rawBody,
        signature: input.signature,
        secret: input.secret,
      });
      if (!ok) {
        throw new Error("Invalid webhook signature");
      }
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input.rawBody);
    } catch (err) {
      throw new Error(
        `Webhook body is not valid JSON: ${(err as Error).message}`,
      );
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Webhook body must be a JSON object");
    }
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.event !== "string") {
      throw new Error("Webhook body is missing `event`");
    }

    return {
      event: obj.event,
      deliveredAt:
        typeof obj.deliveredAt === "number"
          ? obj.deliveredAt
          : Math.floor(Date.now() / 1000),
      data: obj.data as T,
    };
  }
}
