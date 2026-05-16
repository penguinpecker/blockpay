import { describe, it, expect, vi } from "vitest";

import {
  AppClient,
  buildInvoicePayloadFromOrder,
  defaultCurrencyForShopifyCode,
} from "../src/app.js";
import type { ShopifyOrder } from "../src/types.js";

function makeOrder(overrides: Partial<ShopifyOrder> = {}): ShopifyOrder {
  return {
    id: 5550000000001,
    name: "#1001",
    currency: "USD",
    total_price: "49.99",
    email: "buyer@example.com",
    line_items: [
      {
        id: 90001,
        title: "Mole T-Shirt",
        quantity: 1,
        price: "24.99",
        variant_title: "Large",
      },
      {
        id: 90002,
        title: "Mole Mug",
        quantity: 1,
        price: "25.00",
      },
    ],
    ...overrides,
  };
}

function mockFetch(handler: (url: string, init: RequestInit) => {
  ok: boolean;
  status: number;
  body: unknown;
  statusText?: string;
}): typeof fetch {
  const fn = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
    const result = handler(url, init);
    return {
      ok: result.ok,
      status: result.status,
      statusText: result.statusText ?? (result.ok ? "OK" : "Error"),
      json: async () => result.body,
      text: async () =>
        typeof result.body === "string"
          ? result.body
          : JSON.stringify(result.body),
    };
  });
  return fn as unknown as typeof fetch;
}

describe("defaultCurrencyForShopifyCode", () => {
  it("maps EUR to EURC and everything else to USDC", () => {
    expect(defaultCurrencyForShopifyCode("EUR")).toBe("EURC");
    expect(defaultCurrencyForShopifyCode("eur")).toBe("EURC");
    expect(defaultCurrencyForShopifyCode("USD")).toBe("USDC");
    expect(defaultCurrencyForShopifyCode("JPY")).toBe("USDC");
  });
});

describe("buildInvoicePayloadFromOrder", () => {
  it("derives label, currency, and metadata from the order", () => {
    const payload = buildInvoicePayloadFromOrder(makeOrder(), {
      shopDomain: "demo.myshopify.com",
    }) as Record<string, unknown>;
    expect(payload.amount).toBe("49.99");
    expect(payload.currency).toBe("USDC");
    expect(payload.label).toBe("Shopify order #1001");
    const meta = payload.metadata as Record<string, string>;
    expect(meta.shopify_order_id).toBe("5550000000001");
    expect(meta.shopify_order_name).toBe("#1001");
    expect(meta.shopify_customer_email).toBe("buyer@example.com");
    expect(meta.source).toBe("shopify-app");
  });

  it("uses order id when name is missing and merges extra metadata", () => {
    const payload = buildInvoicePayloadFromOrder(
      makeOrder({ name: undefined }),
      {
        shopDomain: "demo.myshopify.com",
        metadata: { campaign: "spring" },
      },
    ) as Record<string, unknown>;
    expect(payload.label).toBe("Shopify order 5550000000001");
    expect((payload.metadata as Record<string, string>).campaign).toBe(
      "spring",
    );
  });

  it("throws when line_items are missing", () => {
    expect(() =>
      buildInvoicePayloadFromOrder(
        makeOrder({ line_items: [] }),
        { shopDomain: "demo.myshopify.com" },
      ),
    ).toThrow();
  });
});

describe("AppClient.syncOrderToInvoice", () => {
  it("posts the canonical body and returns the invoice", async () => {
    const fetchMock = mockFetch((url) => {
      expect(url).toBe("https://blockpay-six.vercel.app/api/v1/invoices");
      return {
        ok: true,
        status: 200,
        body: {
          id: "inv_xyz",
          merchantId: "m_1",
          label: "Shopify order #1001",
          amount: "49.99",
          currency: "USDC",
          chainKey: "base",
          status: "pending",
          checkoutUrl: "https://blockpay.example/pay/inv_xyz",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          metadata: { shopify_order_id: "5550000000001" },
        },
      };
    });

    const client = new AppClient({
      apiKey: "sk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });
    const invoice = await client.syncOrderToInvoice(makeOrder());
    expect(invoice.id).toBe("inv_xyz");

    const call = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk_test");
    expect(headers["X-Blockpay-Source"]).toBe("shopify-app");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.amount).toBe("49.99");
    expect((body.metadata as Record<string, string>).shopify_order_id).toBe(
      "5550000000001",
    );
  });

  it("throws a descriptive error on non-2xx", async () => {
    const fetchMock = mockFetch(() => ({
      ok: false,
      status: 401,
      body: { error: { code: "unauthorised" } },
    }));
    const client = new AppClient({
      apiKey: "sk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });
    await expect(client.syncOrderToInvoice(makeOrder())).rejects.toThrow(
      /BlockPay invoice creation failed \(401\)/,
    );
  });
});

describe("AppClient.markOrderPaid", () => {
  it("POSTs a capture transaction to the Shopify Admin API", async () => {
    const fetchMock = mockFetch((url, init) => {
      expect(url).toBe(
        "https://demo.myshopify.com/admin/api/2024-10/orders/5550000000001/transactions.json",
      );
      expect((init.headers as Record<string, string>)["X-Shopify-Access-Token"]).toBe(
        "shpat_xyz",
      );
      const body = JSON.parse(init.body as string) as {
        transaction: Record<string, unknown>;
      };
      expect(body.transaction.kind).toBe("capture");
      expect(body.transaction.status).toBe("success");
      expect(body.transaction.authorization).toBe("0xdeadbeef");
      return {
        ok: true,
        status: 201,
        body: { transaction: { id: 7777 } },
      };
    });

    const client = new AppClient({
      apiKey: "sk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });

    const result = await client.markOrderPaid(5550000000001, "0xdeadbeef", {
      shopifyAccessToken: "shpat_xyz",
      amount: "49.99",
      currency: "USD",
    });

    expect(result.status).toBe(201);
    expect(result.transactionId).toBe("7777");
  });

  it("throws when Shopify rejects the call", async () => {
    const fetchMock = mockFetch(() => ({
      ok: false,
      status: 422,
      body: { errors: { base: ["already_captured"] } },
    }));
    const client = new AppClient({
      apiKey: "sk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });
    await expect(
      client.markOrderPaid("1", "0xfeed", {
        shopifyAccessToken: "shpat_xyz",
      }),
    ).rejects.toThrow(/Shopify transactions.json failed \(422\)/);
  });

  it("rejects calls with missing arguments", async () => {
    const client = new AppClient({
      apiKey: "sk_test",
      shopDomain: "demo.myshopify.com",
      fetch: mockFetch(() => ({ ok: true, status: 200, body: {} })),
    });
    await expect(
      client.markOrderPaid("", "0xfeed", { shopifyAccessToken: "x" }),
    ).rejects.toThrow(/orderId is required/);
    await expect(
      client.markOrderPaid("1", "", { shopifyAccessToken: "x" }),
    ).rejects.toThrow(/txHash is required/);
    await expect(
      client.markOrderPaid("1", "0xfeed", { shopifyAccessToken: "" }),
    ).rejects.toThrow(/shopifyAccessToken is required/);
  });
});
