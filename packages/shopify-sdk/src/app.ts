/**
 * `AppClient` — server-side helper for Shopify Apps.
 *
 * Use from a Shopify App (Remix, Next.js, or any Node runtime) to
 * sync Shopify orders into BlockPay invoices, and to mark Shopify
 * orders as paid once BlockPay reports a settled payment.
 *
 * Unlike `ThemeClient`, this client uses your **secret** BlockPay
 * API key — never ship it to the storefront.
 */

import type {
  BlockPayChainKey,
  BlockPayCurrency,
  BlockPayInvoice,
  CartConversionOptions,
  ShopifyOrder,
  ShopifyOrderLineItem,
} from "./types.js";

export type { ShopifyOrder, ShopifyOrderLineItem };

const DEFAULT_API_BASE_URL = "https://blockpay-six.vercel.app";
const DEFAULT_SHOPIFY_API_VERSION = "2024-10";

/** Options accepted by the `AppClient` constructor. */
export interface AppClientOptions {
  /** Server-side BlockPay secret key. */
  apiKey: string;
  /** Shopify shop domain, e.g. "demo.myshopify.com". */
  shopDomain: string;
  /** Override the BlockPay API base URL. */
  baseUrl?: string;
  /** Override the Shopify Admin API base URL. */
  shopifyBaseUrl?: string;
  /** Shopify Admin API version. Defaults to "2024-10". */
  shopifyApiVersion?: string;
  /** Custom fetch implementation (handy for tests). */
  fetch?: typeof fetch;
  /** Default conversion options applied to every order sync. */
  defaults?: CartConversionOptions;
}

/** Options for `markOrderPaid()`. */
export interface MarkOrderPaidOptions {
  /** Shopify Admin API access token for the shop. */
  shopifyAccessToken: string;
  /**
   * Currency to record the transaction in. Defaults to the order's
   * presentment currency — most callers won't need this.
   */
  currency?: string;
  /**
   * Amount captured in decimal-string form (e.g. "49.50"). Defaults
   * to the order's `total_price` if not provided.
   */
  amount?: string;
  /** Override the gateway name. Defaults to "BlockPay". */
  gateway?: string;
}

/** Result of `markOrderPaid()`. */
export interface MarkOrderPaidResult {
  /** Shopify transaction id, if returned. */
  transactionId?: string;
  /** HTTP status of the Shopify Admin call. */
  status: number;
  /** Raw response body (parsed JSON when available). */
  body: unknown;
}

/**
 * Server-side BlockPay client tuned for Shopify Apps.
 */
export class AppClient {
  private readonly apiKey: string;
  private readonly shopDomain: string;
  private readonly baseUrl: string;
  private readonly shopifyBaseUrl: string;
  private readonly shopifyApiVersion: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaults: CartConversionOptions;

  constructor(opts: AppClientOptions) {
    if (!opts.apiKey) {
      throw new Error("AppClient: apiKey is required");
    }
    if (!opts.shopDomain) {
      throw new Error("AppClient: shopDomain is required");
    }
    this.apiKey = opts.apiKey;
    this.shopDomain = opts.shopDomain;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
    this.shopifyBaseUrl = (
      opts.shopifyBaseUrl ?? `https://${opts.shopDomain}`
    ).replace(/\/$/, "");
    this.shopifyApiVersion =
      opts.shopifyApiVersion ?? DEFAULT_SHOPIFY_API_VERSION;
    this.fetchImpl =
      opts.fetch ??
      (typeof fetch !== "undefined"
        ? fetch.bind(globalThis)
        : ((() => {
            throw new Error(
              "AppClient: no fetch implementation available in this runtime",
            );
          }) as typeof fetch));
    this.defaults = opts.defaults ?? {};
  }

  /**
   * Sync a Shopify Admin order into a BlockPay invoice.
   *
   * The resulting invoice's metadata always carries
   * `shopify_order_id` so the webhook bridge can map back when the
   * payment settles.
   */
  async syncOrderToInvoice(
    order: ShopifyOrder,
    conversion: CartConversionOptions = {},
  ): Promise<BlockPayInvoice> {
    const payload = buildInvoicePayloadFromOrder(order, {
      ...this.defaults,
      ...conversion,
      shopDomain: this.shopDomain,
    });

    const url = `${this.baseUrl}/api/v1/invoices`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Blockpay-Source": "shopify-app",
        "User-Agent": "blockpay-shopify-sdk/0.1.0",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await safeReadText(res);
      throw new Error(
        `BlockPay invoice creation failed (${res.status}): ${text || res.statusText}`,
      );
    }
    const invoice = (await res.json()) as BlockPayInvoice;
    if (!invoice || !invoice.id || !invoice.checkoutUrl) {
      throw new Error(
        "BlockPay invoice response is missing `id` or `checkoutUrl`",
      );
    }
    return invoice;
  }

  /**
   * Record a captured transaction against a Shopify order. Use this
   * from your BlockPay webhook handler once `invoice.paid` arrives.
   *
   * Calls `POST /admin/api/{ver}/orders/{id}/transactions.json` with
   * a `kind: "capture"` transaction. The Shopify access token must
   * carry `write_orders` scope.
   */
  async markOrderPaid(
    orderId: string | number,
    txHash: string,
    opts: MarkOrderPaidOptions,
  ): Promise<MarkOrderPaidResult> {
    if (!orderId) {
      throw new Error("markOrderPaid: orderId is required");
    }
    if (!txHash) {
      throw new Error("markOrderPaid: txHash is required");
    }
    if (!opts.shopifyAccessToken) {
      throw new Error("markOrderPaid: shopifyAccessToken is required");
    }

    const url = `${this.shopifyBaseUrl}/admin/api/${this.shopifyApiVersion}/orders/${encodeURIComponent(String(orderId))}/transactions.json`;

    const body: Record<string, unknown> = {
      transaction: {
        kind: "capture",
        status: "success",
        gateway: opts.gateway ?? "BlockPay",
        source_name: "blockpay",
        authorization: txHash,
        ...(opts.amount ? { amount: opts.amount } : {}),
        ...(opts.currency ? { currency: opts.currency } : {}),
        message: `BlockPay settled on-chain (${txHash})`,
      },
    };

    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": opts.shopifyAccessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await safeReadText(res);
    let parsed: unknown = raw;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        // leave as text
      }
    }

    if (!res.ok) {
      throw new Error(
        `Shopify transactions.json failed (${res.status}): ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`,
      );
    }

    const transactionId = extractTransactionId(parsed);
    return {
      transactionId,
      status: res.status,
      body: parsed,
    };
  }
}

/** Read `transaction.id` from a typical Shopify response body. */
function extractTransactionId(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const tx = (body as { transaction?: { id?: number | string } }).transaction;
  if (!tx || tx.id === undefined) return undefined;
  return String(tx.id);
}

/**
 * Build the request body sent to `POST /api/v1/invoices` for a given
 * Shopify order. Exposed so callers can inspect/modify the payload.
 */
export function buildInvoicePayloadFromOrder(
  order: ShopifyOrder,
  opts: CartConversionOptions & { shopDomain: string },
): Record<string, unknown> {
  if (!order || typeof order !== "object") {
    throw new Error("buildInvoicePayloadFromOrder: order is required");
  }
  if (!Array.isArray(order.line_items) || order.line_items.length === 0) {
    throw new Error("buildInvoicePayloadFromOrder: order has no line_items");
  }
  if (!order.total_price) {
    throw new Error("buildInvoicePayloadFromOrder: order.total_price missing");
  }

  const currency: BlockPayCurrency =
    opts.currency ?? defaultCurrencyForShopifyCode(order.currency);
  const chainKey: BlockPayChainKey = opts.chainKey ?? "base";
  const label =
    opts.label ??
    (order.name ? `Shopify order ${order.name}` : `Shopify order ${order.id}`);

  return {
    label,
    amount: order.total_price,
    currency,
    chainKey,
    description: opts.description,
    successUrl: opts.successUrl,
    cancelUrl: opts.cancelUrl,
    expiresAt: opts.expiresAt,
    lineItems: order.line_items.map((item) => ({
      description:
        item.variant_title && item.variant_title.length > 0
          ? `${item.title} (${item.variant_title})`
          : item.title,
      unitAmount: item.price,
      quantity: item.quantity,
    })),
    metadata: {
      source: "shopify-app",
      shop_domain: opts.shopDomain,
      shopify_order_id: String(order.id),
      ...(order.name ? { shopify_order_name: order.name } : {}),
      ...(order.email ? { shopify_customer_email: order.email } : {}),
      shopify_currency: order.currency,
      ...(opts.metadata ?? {}),
    },
  };
}

/**
 * Default Shopify→BlockPay currency mapping for orders. Exported so
 * tests can verify the table.
 */
export function defaultCurrencyForShopifyCode(
  code: string,
): BlockPayCurrency {
  const upper = code.toUpperCase();
  if (upper === "EUR") return "EURC";
  return "USDC";
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
