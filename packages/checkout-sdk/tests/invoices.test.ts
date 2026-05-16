import { describe, expect, it, vi } from "vitest";
import BlockPay, { BlockPayError } from "../src/index.js";
import type { Invoice } from "../src/types.js";

function makeFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
): typeof fetch {
  return (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input.toString();
    return handler(url, init);
  }) as typeof fetch;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const sampleInvoice: Invoice = {
  id: "inv_test_123",
  merchantId: "mer_42",
  label: "Pro plan",
  amount: "29.00",
  currency: "USDC",
  chainKey: "base",
  status: "pending",
  checkoutUrl: "https://blockpay-six.vercel.app/checkout/inv_test_123",
  createdAt: "2026-05-16T00:00:00Z",
  updatedAt: "2026-05-16T00:00:00Z",
};

describe("InvoicesModule", () => {
  it("create() POSTs to /api/v1/invoices with Bearer auth and returns the parsed Invoice", async () => {
    const fetchImpl = vi.fn(
      makeFetch((url, init) => {
        expect(url).toBe("https://blockpay-six.vercel.app/api/v1/invoices");
        expect(init.method).toBe("POST");
        const headers = init.headers as Record<string, string>;
        expect(headers.Authorization).toBe("Bearer test_key");
        expect(headers["Content-Type"]).toBe("application/json");
        expect(JSON.parse(init.body as string)).toEqual({
          label: "Pro plan",
          amount: "29.00",
          currency: "USDC",
          chainKey: "base",
        });
        return jsonResponse(sampleInvoice);
      }),
    );

    const bp = new BlockPay({ apiKey: "test_key", fetch: fetchImpl });
    const inv = await bp.invoices.create({
      label: "Pro plan",
      amount: "29.00",
      currency: "USDC",
      chainKey: "base",
    });

    expect(inv).toEqual(sampleInvoice);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("get() URL-encodes the id and returns the parsed Invoice", async () => {
    const fetchImpl = makeFetch((url) => {
      expect(url).toBe(
        "https://blockpay-six.vercel.app/api/v1/invoices/inv%2Ftest%20123",
      );
      return jsonResponse({ ...sampleInvoice, id: "inv/test 123" });
    });

    const bp = new BlockPay({ apiKey: "test_key", fetch: fetchImpl });
    const inv = await bp.invoices.get("inv/test 123");
    expect(inv.id).toBe("inv/test 123");
  });

  it("list() forwards query filters and unwraps a paginated envelope", async () => {
    const fetchImpl = makeFetch((url) => {
      const u = new URL(url);
      expect(u.pathname).toBe("/api/v1/invoices");
      expect(u.searchParams.get("status")).toBe("paid");
      expect(u.searchParams.get("merchantId")).toBe("mer_42");
      expect(u.searchParams.has("limit")).toBe(false);
      return jsonResponse({
        data: [sampleInvoice, { ...sampleInvoice, id: "inv_test_456" }],
        nextCursor: "cur_abc",
      });
    });

    const bp = new BlockPay({ apiKey: "test_key", fetch: fetchImpl });
    const rows = await bp.invoices.list({
      merchantId: "mer_42",
      status: "paid",
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]?.id).toBe("inv_test_123");
  });

  it("throws a typed BlockPayError on non-2xx responses", async () => {
    const fetchImpl = makeFetch(() =>
      jsonResponse(
        { error: { code: "invoice_not_found", message: "no such invoice" } },
        404,
      ),
    );

    const bp = new BlockPay({ apiKey: "test_key", fetch: fetchImpl });
    await expect(bp.invoices.get("missing")).rejects.toBeInstanceOf(
      BlockPayError,
    );
    try {
      await bp.invoices.get("missing");
    } catch (err) {
      const e = err as BlockPayError;
      expect(e.status).toBe(404);
      expect(e.code).toBe("invoice_not_found");
      expect(e.message).toBe("no such invoice");
    }
  });

  it("wraps network failures as BlockPayError with status 0", async () => {
    const fetchImpl = makeFetch(() => {
      throw new TypeError("socket hang up");
    });

    const bp = new BlockPay({ apiKey: "test_key", fetch: fetchImpl });
    await expect(bp.invoices.list()).rejects.toMatchObject({
      name: "BlockPayError",
      status: 0,
      code: "network_error",
    });
  });
});
