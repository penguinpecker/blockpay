/**
 * `WebhookBridge` — verify outgoing BlockPay webhooks and route the
 * events at the appropriate Shopify Admin action.
 *
 * Uses Stripe-style `t=<unix>,v1=<hex>` signatures: HMAC-SHA256 of
 * `${timestamp}.${rawBody}` keyed on the per-endpoint secret. Also
 * accepts plain `sha256=<hex>` or bare hex for compatibility with
 * older BlockPay webhooks.
 *
 * If `@blockpay/checkout` is installed, the bridge will *prefer* its
 * audited `WebhooksModule.verify()`. Otherwise it falls back to a
 * self-contained implementation built on `node:crypto` / WebCrypto.
 */

import type { BlockPayEvent, BlockPayInvoice } from "./types.js";

/** Input accepted by `WebhookBridge.verify()`. */
export interface VerifyInput {
  /** Raw HTTP body string — exactly as received. */
  rawBody: string;
  /** Value of the `X-Blockpay-Signature` header. */
  signature: string;
  /** Per-endpoint secret. Falls back to the constructor secret. */
  secret?: string;
  /**
   * Maximum age in seconds for the `t=` timestamp. Defaults to 300
   * (5 minutes). Set to 0 to disable. Only used for Stripe-style
   * signatures.
   */
  toleranceSeconds?: number;
  /**
   * Override "now" — used by tests. Unix seconds.
   */
  now?: number;
}

/** Map of handlers passed to `routeEvent()`. */
export interface WebhookHandlers {
  onInvoicePaid?: (
    event: BlockPayEvent<BlockPayInvoice>,
  ) => void | Promise<void>;
  onInvoiceExpired?: (
    event: BlockPayEvent<BlockPayInvoice>,
  ) => void | Promise<void>;
  onInvoiceCancelled?: (
    event: BlockPayEvent<BlockPayInvoice>,
  ) => void | Promise<void>;
  onPaymentReceived?: (
    event: BlockPayEvent<BlockPayInvoice>,
  ) => void | Promise<void>;
  onPaymentLinkUsed?: (event: BlockPayEvent) => void | Promise<void>;
  /** Catch-all called when no specific handler matches the event name. */
  onOther?: (event: BlockPayEvent) => void | Promise<void>;
}

/** Constructor options for `WebhookBridge`. */
export interface WebhookBridgeOptions {
  /**
   * Default endpoint signing secret. Optional — you can also pass
   * `secret` per call to `verify()`.
   */
  secret?: string;
  /**
   * Optional pre-imported peer SDK module. The bridge will use its
   * `WebhooksModule.verify()` instead of the built-in HMAC code,
   * which is handy if you have many endpoints and want to centralise
   * the audit trail. The bridge auto-discovers `@blockpay/checkout`
   * if it's importable; this option is mainly for tests / forks.
   */
  peerVerifier?: PeerVerifier;
}

/**
 * Shape used by an injected peer verifier. The `@blockpay/checkout`
 * `WebhooksModule` matches this contract — passing one in is purely
 * optional.
 */
export interface PeerVerifier {
  verify(input: {
    rawBody: string;
    signature: string;
    secret: string;
  }): Promise<boolean> | boolean;
}

/** Bridge BlockPay webhook events to Shopify-side actions. */
export class WebhookBridge {
  private readonly secret?: string;
  private readonly peerVerifier?: PeerVerifier;

  constructor(opts: WebhookBridgeOptions = {}) {
    this.secret = opts.secret;
    this.peerVerifier = opts.peerVerifier;
  }

  /**
   * Verify a webhook signature. Returns `true` on success and
   * `false` on every failure mode (bad signature, missing fields,
   * stale timestamp) — never throws.
   */
  async verify(input: VerifyInput): Promise<boolean> {
    const secret = input.secret ?? this.secret;
    if (!secret) return false;
    if (!input.rawBody) return false;
    if (!input.signature) return false;

    const parts = parseSignatureHeader(input.signature);

    if (parts.kind === "stripe") {
      // Stripe-style: HMAC over `${t}.${rawBody}`.
      const tolerance = input.toleranceSeconds ?? 300;
      if (tolerance > 0) {
        const now = input.now ?? Math.floor(Date.now() / 1000);
        if (Math.abs(now - parts.timestamp) > tolerance) {
          return false;
        }
      }
      const signedPayload = `${parts.timestamp}.${input.rawBody}`;
      const expected = await this.computeHmacHex(secret, signedPayload);
      return parts.signatures.some((s) => timingSafeEqualHex(expected, s));
    }

    // Plain-hex (or `sha256=hex`) over the raw body.
    if (this.peerVerifier) {
      try {
        return await this.peerVerifier.verify({
          rawBody: input.rawBody,
          signature: parts.hex,
          secret,
        });
      } catch {
        return false;
      }
    }

    const expected = await this.computeHmacHex(secret, input.rawBody);
    return timingSafeEqualHex(expected, parts.hex);
  }

  /**
   * Parse a raw body into a typed `BlockPayEvent`. Throws on invalid
   * JSON or a missing `event` field.
   */
  parseEvent<T = BlockPayInvoice>(rawBody: string): BlockPayEvent<T> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
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
    const deliveredAt =
      typeof obj.deliveredAt === "number"
        ? obj.deliveredAt
        : Math.floor(Date.now() / 1000);
    return {
      event: obj.event,
      deliveredAt,
      data: obj.data as T,
    };
  }

  /**
   * Dispatch a parsed event to the appropriate handler. Unknown
   * events fall through to `onOther`. Handlers may be async — this
   * resolves once the matched handler finishes.
   */
  async routeEvent(
    event: BlockPayEvent,
    handlers: WebhookHandlers,
  ): Promise<void> {
    const typed = event as BlockPayEvent<BlockPayInvoice>;
    switch (event.event) {
      case "invoice.paid":
        if (handlers.onInvoicePaid) {
          await handlers.onInvoicePaid(typed);
          return;
        }
        break;
      case "invoice.expired":
        if (handlers.onInvoiceExpired) {
          await handlers.onInvoiceExpired(typed);
          return;
        }
        break;
      case "invoice.cancelled":
        if (handlers.onInvoiceCancelled) {
          await handlers.onInvoiceCancelled(typed);
          return;
        }
        break;
      case "payment.received":
        if (handlers.onPaymentReceived) {
          await handlers.onPaymentReceived(typed);
          return;
        }
        break;
      case "payment_link.used":
        if (handlers.onPaymentLinkUsed) {
          await handlers.onPaymentLinkUsed(event);
          return;
        }
        break;
    }
    if (handlers.onOther) {
      await handlers.onOther(event);
    }
  }

  /** Convenience: verify, parse, and route in one call. */
  async handle(
    input: VerifyInput,
    handlers: WebhookHandlers,
  ): Promise<{ verified: boolean; routed: boolean }> {
    const verified = await this.verify(input);
    if (!verified) {
      return { verified: false, routed: false };
    }
    const event = this.parseEvent(input.rawBody);
    await this.routeEvent(event, handlers);
    return { verified: true, routed: true };
  }

  // -- internal ----------------------------------------------------------

  private async computeHmacHex(
    secret: string,
    payload: string,
  ): Promise<string> {
    const nodeCrypto = await tryImportNodeCrypto();
    if (nodeCrypto && typeof nodeCrypto.createHmac === "function") {
      return nodeCrypto
        .createHmac("sha256", secret)
        .update(payload, "utf8")
        .digest("hex");
    }
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      throw new Error(
        "No usable crypto implementation (need node:crypto or crypto.subtle)",
      );
    }
    const enc = new TextEncoder();
    const key = await subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await subtle.sign("HMAC", key, enc.encode(payload));
    return toHex(new Uint8Array(sigBuf));
  }
}

/** Parsed shape of a BlockPay signature header. */
type ParsedSignature =
  | {
      kind: "stripe";
      timestamp: number;
      signatures: string[];
    }
  | {
      kind: "plain";
      hex: string;
    };

export function parseSignatureHeader(header: string): ParsedSignature {
  const trimmed = header.trim();
  if (trimmed.includes("=") && trimmed.includes(",")) {
    // Try Stripe-style: t=...,v1=...,v1=...
    const parts = trimmed.split(",").map((p) => p.trim());
    let timestamp: number | undefined;
    const signatures: string[] = [];
    for (const part of parts) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq);
      const value = part.slice(eq + 1);
      if (key === "t") {
        const n = Number.parseInt(value, 10);
        if (Number.isFinite(n)) timestamp = n;
      } else if (key === "v1") {
        signatures.push(value.toLowerCase());
      }
    }
    if (timestamp !== undefined && signatures.length > 0) {
      return { kind: "stripe", timestamp, signatures };
    }
  }
  // Plain `sha256=hex` or bare hex.
  const hex = trimmed.startsWith("sha256=")
    ? trimmed.slice("sha256=".length).toLowerCase()
    : trimmed.toLowerCase();
  return { kind: "plain", hex };
}

async function tryImportNodeCrypto(): Promise<
  typeof import("node:crypto") | null
> {
  try {
    const mod = await import("node:crypto");
    return mod;
  } catch {
    return null;
  }
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
