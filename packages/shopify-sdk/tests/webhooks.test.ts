import { describe, it, expect, vi } from "vitest";
import { createHmac } from "node:crypto";

import {
  WebhookBridge,
  parseSignatureHeader,
  timingSafeEqualHex,
} from "../src/webhooks.js";

const SECRET = "whsec_test_secret_value";
const BODY = JSON.stringify({
  event: "invoice.paid",
  deliveredAt: 1_700_000_000,
  data: {
    id: "inv_xyz",
    merchantId: "m_1",
    label: "Order #1001",
    amount: "29.00",
    currency: "USDC",
    chainKey: "base",
    status: "paid",
    checkoutUrl: "https://blockpay.example/pay/inv_xyz",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    paymentTxHash:
      "0xabc0000000000000000000000000000000000000000000000000000000000001",
    metadata: { shopify_order_id: "5550000000001" },
  },
});

function plainHex(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function stripeStyleHeader(
  body: string,
  secret: string,
  timestamp: number,
): string {
  const sig = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
  return `t=${timestamp},v1=${sig}`;
}

describe("parseSignatureHeader", () => {
  it("parses Stripe-style signatures", () => {
    const parsed = parseSignatureHeader("t=1700000000,v1=abcd,v1=ef01");
    expect(parsed).toEqual({
      kind: "stripe",
      timestamp: 1_700_000_000,
      signatures: ["abcd", "ef01"],
    });
  });

  it("falls back to plain hex when there's no t=", () => {
    const parsed = parseSignatureHeader("sha256=DEADBEEF");
    expect(parsed).toEqual({ kind: "plain", hex: "deadbeef" });
  });

  it("accepts a bare hex value", () => {
    const parsed = parseSignatureHeader("ABC123");
    expect(parsed).toEqual({ kind: "plain", hex: "abc123" });
  });
});

describe("timingSafeEqualHex", () => {
  it("returns true on identical strings", () => {
    expect(timingSafeEqualHex("abc", "abc")).toBe(true);
  });
  it("returns false on different strings", () => {
    expect(timingSafeEqualHex("abc", "abd")).toBe(false);
  });
  it("returns false when lengths differ", () => {
    expect(timingSafeEqualHex("abc", "ab")).toBe(false);
  });
});

describe("WebhookBridge.verify", () => {
  it("verifies a valid plain-hex signature", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const sig = plainHex(BODY, SECRET);
    const ok = await bridge.verify({ rawBody: BODY, signature: sig });
    expect(ok).toBe(true);
  });

  it("verifies a valid sha256= prefixed signature", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const sig = `sha256=${plainHex(BODY, SECRET)}`;
    expect(
      await bridge.verify({ rawBody: BODY, signature: sig }),
    ).toBe(true);
  });

  it("verifies a valid Stripe-style t=...,v1=... signature", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const now = 1_700_000_000;
    const header = stripeStyleHeader(BODY, SECRET, now);
    expect(
      await bridge.verify({
        rawBody: BODY,
        signature: header,
        now,
      }),
    ).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const sig = plainHex(BODY, SECRET);
    const ok = await bridge.verify({
      rawBody: BODY.replace("29.00", "0.01"),
      signature: sig,
    });
    expect(ok).toBe(false);
  });

  it("rejects when the wrong secret is used", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const sig = plainHex(BODY, "different-secret");
    const ok = await bridge.verify({ rawBody: BODY, signature: sig });
    expect(ok).toBe(false);
  });

  it("rejects a stale Stripe-style timestamp outside tolerance", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const oldTs = 1_700_000_000;
    const header = stripeStyleHeader(BODY, SECRET, oldTs);
    const ok = await bridge.verify({
      rawBody: BODY,
      signature: header,
      now: oldTs + 3600, // an hour later
      toleranceSeconds: 300,
    });
    expect(ok).toBe(false);
  });

  it("returns false when secret/body/signature are missing", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    expect(await bridge.verify({ rawBody: "", signature: "x" })).toBe(false);
    expect(await bridge.verify({ rawBody: BODY, signature: "" })).toBe(false);
    expect(
      await new WebhookBridge().verify({ rawBody: BODY, signature: "x" }),
    ).toBe(false);
  });

  it("prefers the injected peer verifier when given (plain-hex path)", async () => {
    const peer = { verify: vi.fn().mockResolvedValue(true) };
    const bridge = new WebhookBridge({ secret: SECRET, peerVerifier: peer });
    const sig = plainHex(BODY, SECRET);
    const ok = await bridge.verify({ rawBody: BODY, signature: sig });
    expect(ok).toBe(true);
    expect(peer.verify).toHaveBeenCalledWith({
      rawBody: BODY,
      signature: sig,
      secret: SECRET,
    });
  });
});

describe("WebhookBridge.routeEvent", () => {
  it("dispatches invoice.paid to the matching handler", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const onInvoicePaid = vi.fn();
    const onOther = vi.fn();
    await bridge.routeEvent(JSON.parse(BODY), { onInvoicePaid, onOther });
    expect(onInvoicePaid).toHaveBeenCalledOnce();
    expect(onOther).not.toHaveBeenCalled();
  });

  it("falls back to onOther for unknown events", async () => {
    const bridge = new WebhookBridge();
    const onOther = vi.fn();
    await bridge.routeEvent(
      {
        event: "merchant.updated",
        deliveredAt: 1,
        data: { foo: "bar" } as unknown as never,
      },
      { onOther },
    );
    expect(onOther).toHaveBeenCalledOnce();
  });
});

describe("WebhookBridge.handle", () => {
  it("verifies + parses + routes in one call when the signature is valid", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const sig = plainHex(BODY, SECRET);
    const onInvoicePaid = vi.fn();
    const result = await bridge.handle(
      { rawBody: BODY, signature: sig },
      { onInvoicePaid },
    );
    expect(result).toEqual({ verified: true, routed: true });
    expect(onInvoicePaid).toHaveBeenCalledOnce();
  });

  it("short-circuits when verification fails", async () => {
    const bridge = new WebhookBridge({ secret: SECRET });
    const onInvoicePaid = vi.fn();
    const result = await bridge.handle(
      { rawBody: BODY, signature: "deadbeef" },
      { onInvoicePaid },
    );
    expect(result).toEqual({ verified: false, routed: false });
    expect(onInvoicePaid).not.toHaveBeenCalled();
  });
});
