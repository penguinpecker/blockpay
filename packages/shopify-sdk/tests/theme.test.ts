import { describe, it, expect, vi } from "vitest";

import {
  ThemeClient,
  buildInvoicePayloadFromCart,
  shopifyMinorUnitsToDecimalString,
  defaultCurrencyFor,
} from "../src/theme.js";
import type { ShopifyCart } from "../src/types.js";

function makeCart(overrides: Partial<ShopifyCart> = {}): ShopifyCart {
  return {
    token: "cart-token-abc",
    currency: "USD",
    total_price: 4999,
    item_count: 2,
    items: [
      {
        id: 101,
        quantity: 1,
        title: "Mole T-Shirt",
        variant_title: "Large",
        price: 2499,
        line_price: 2499,
      },
      {
        id: 102,
        quantity: 1,
        title: "Mole Mug",
        price: 2500,
        line_price: 2500,
      },
    ],
    ...overrides,
  };
}

function mockFetchOk(body: unknown): typeof fetch {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
  return fn as unknown as typeof fetch;
}

describe("shopifyMinorUnitsToDecimalString", () => {
  it("converts cents into a decimal string", () => {
    expect(shopifyMinorUnitsToDecimalString(0)).toBe("0.00");
    expect(shopifyMinorUnitsToDecimalString(50)).toBe("0.50");
    expect(shopifyMinorUnitsToDecimalString(199)).toBe("1.99");
    expect(shopifyMinorUnitsToDecimalString(100000)).toBe("1000.00");
  });

  it("rejects negative or non-finite amounts", () => {
    expect(() => shopifyMinorUnitsToDecimalString(-1)).toThrow();
    expect(() => shopifyMinorUnitsToDecimalString(Number.NaN)).toThrow();
  });
});

describe("defaultCurrencyFor", () => {
  it("maps USD to USDC and EUR to EURC", () => {
    expect(defaultCurrencyFor("USD")).toBe("USDC");
    expect(defaultCurrencyFor("eur")).toBe("EURC");
  });
  it("falls back to USDC for unknown currencies", () => {
    expect(defaultCurrencyFor("JPY")).toBe("USDC");
  });
});

describe("buildInvoicePayloadFromCart", () => {
  it("produces the canonical invoice body for a basic cart", () => {
    const cart = makeCart();
    const payload = buildInvoicePayloadFromCart(cart, {
      shopDomain: "demo.myshopify.com",
    }) as Record<string, unknown>;

    expect(payload.amount).toBe("49.99");
    expect(payload.currency).toBe("USDC");
    expect(payload.chainKey).toBe("base");
    expect(payload.label).toBe("Shopify cart (2 items)");
    expect(payload.lineItems).toEqual([
      {
        description: "Mole T-Shirt (Large)",
        unitAmount: "24.99",
        quantity: 1,
      },
      {
        description: "Mole Mug",
        unitAmount: "25.00",
        quantity: 1,
      },
    ]);
    expect(payload.metadata).toMatchObject({
      source: "shopify-theme",
      shop_domain: "demo.myshopify.com",
      shopify_cart_token: "cart-token-abc",
      shopify_currency: "USD",
    });
  });

  it("respects user-supplied currency, chain, label and metadata", () => {
    const cart = makeCart({ currency: "EUR" });
    const payload = buildInvoicePayloadFromCart(cart, {
      shopDomain: "demo.myshopify.com",
      currency: "USDC",
      chainKey: "polygon",
      label: "Custom label",
      metadata: { campaign: "spring" },
    }) as Record<string, unknown>;

    expect(payload.currency).toBe("USDC");
    expect(payload.chainKey).toBe("polygon");
    expect(payload.label).toBe("Custom label");
    expect((payload.metadata as Record<string, string>).campaign).toBe("spring");
  });

  it("singularises the default label for a one-item cart", () => {
    const cart = makeCart({ item_count: 1 });
    const payload = buildInvoicePayloadFromCart(cart, {
      shopDomain: "demo.myshopify.com",
    }) as Record<string, unknown>;
    expect(payload.label).toBe("Shopify cart (1 item)");
  });

  it("throws when the cart has no items", () => {
    const cart = makeCart({ items: [] });
    expect(() =>
      buildInvoicePayloadFromCart(cart, { shopDomain: "demo.myshopify.com" }),
    ).toThrow();
  });
});

describe("ThemeClient.cartToInvoice", () => {
  it("POSTs the canonical body and returns the checkout URL", async () => {
    const fetchMock = mockFetchOk({
      id: "inv_123",
      merchantId: "m_1",
      label: "Shopify cart (2 items)",
      amount: "49.99",
      currency: "USDC",
      chainKey: "base",
      status: "pending",
      checkoutUrl: "https://blockpay.example/pay/inv_123",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    const client = new ThemeClient({
      apiKey: "pk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });

    const result = await client.cartToInvoice(makeCart());

    expect(result.invoiceId).toBe("inv_123");
    expect(result.checkoutUrl).toBe("https://blockpay.example/pay/inv_123");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const call = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const url = call[0] as string;
    const init = call[1] as RequestInit;
    expect(url).toBe("https://blockpay-six.vercel.app/api/v1/invoices");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer pk_test");
    expect(headers["X-Blockpay-Source"]).toBe("shopify-theme");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.amount).toBe("49.99");
    expect((body.metadata as Record<string, string>).shop_domain).toBe(
      "demo.myshopify.com",
    );
  });

  it("throws a descriptive error when the API responds non-2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      statusText: "Payment Required",
      text: async () => '{"error":{"code":"insufficient_funds"}}',
      json: async () => ({ error: { code: "insufficient_funds" } }),
    });

    const client = new ThemeClient({
      apiKey: "pk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.cartToInvoice(makeCart())).rejects.toThrow(
      /BlockPay invoice creation failed \(402\)/,
    );
  });

  it("throws if the API returns a body without checkoutUrl", async () => {
    const fetchMock = mockFetchOk({ id: "inv_123" });
    const client = new ThemeClient({
      apiKey: "pk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
    });
    await expect(client.cartToInvoice(makeCart())).rejects.toThrow(
      /missing `id` or `checkoutUrl`/,
    );
  });

  it("merges constructor defaults with per-call conversion options", async () => {
    const fetchMock = mockFetchOk({
      id: "inv_456",
      merchantId: "m_1",
      label: "Override",
      amount: "49.99",
      currency: "EURC",
      chainKey: "polygon",
      status: "pending",
      checkoutUrl: "https://blockpay.example/pay/inv_456",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    const client = new ThemeClient({
      apiKey: "pk_test",
      shopDomain: "demo.myshopify.com",
      fetch: fetchMock,
      defaults: { chainKey: "polygon" },
    });

    await client.cartToInvoice(makeCart(), { currency: "EURC" });
    const body = JSON.parse(
      ((fetchMock as ReturnType<typeof vi.fn>).mock.calls[0]![1] as RequestInit)
        .body as string,
    ) as Record<string, unknown>;
    expect(body.chainKey).toBe("polygon");
    expect(body.currency).toBe("EURC");
  });
});
