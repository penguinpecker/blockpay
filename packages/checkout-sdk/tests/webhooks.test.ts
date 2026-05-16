import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebhooksModule } from "../src/webhooks.js";

const SECRET = "whsec_test_super_secret";

function sign(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

describe("WebhooksModule.verify", () => {
  const webhooks = new WebhooksModule();

  it("returns true for a correct signature", async () => {
    const body = JSON.stringify({ event: "invoice.paid", data: { id: "x" } });
    const signature = sign(body);
    expect(
      await webhooks.verify({ rawBody: body, signature, secret: SECRET }),
    ).toBe(true);
  });

  it("accepts the `sha256=` prefix", async () => {
    const body = JSON.stringify({ event: "invoice.paid", data: { id: "x" } });
    const signature = `sha256=${sign(body)}`;
    expect(
      await webhooks.verify({ rawBody: body, signature, secret: SECRET }),
    ).toBe(true);
  });

  it("returns false for a tampered body", async () => {
    const body = JSON.stringify({ event: "invoice.paid", data: { id: "x" } });
    const signature = sign(body);
    const tampered = body.replace('"id":"x"', '"id":"y"');
    expect(
      await webhooks.verify({ rawBody: tampered, signature, secret: SECRET }),
    ).toBe(false);
  });

  it("returns false for the wrong secret", async () => {
    const body = JSON.stringify({ event: "invoice.paid" });
    const signature = sign(body, "whsec_other");
    expect(
      await webhooks.verify({ rawBody: body, signature, secret: SECRET }),
    ).toBe(false);
  });
});

describe("WebhooksModule.parse", () => {
  const webhooks = new WebhooksModule();

  it("parses JSON into a typed envelope", async () => {
    const body = JSON.stringify({
      event: "invoice.paid",
      deliveredAt: 1700000000,
      data: { id: "inv_1" },
    });
    const evt = await webhooks.parse<{ id: string }>({ rawBody: body });
    expect(evt.event).toBe("invoice.paid");
    expect(evt.deliveredAt).toBe(1700000000);
    expect(evt.data.id).toBe("inv_1");
  });

  it("verifies and parses in one call when given a secret", async () => {
    const body = JSON.stringify({ event: "invoice.paid", data: {} });
    const signature = sign(body);
    const evt = await webhooks.parse({
      rawBody: body,
      signature,
      secret: SECRET,
    });
    expect(evt.event).toBe("invoice.paid");
  });

  it("throws when only one of signature/secret is provided", async () => {
    await expect(
      webhooks.parse({ rawBody: "{}", signature: "x" }),
    ).rejects.toThrow();
  });
});
