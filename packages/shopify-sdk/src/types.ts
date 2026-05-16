/**
 * Public types for `@blockpay/shopify`.
 *
 * The Shopify-side types here mirror the shape returned by the
 * Shopify storefront `/cart.js` endpoint and the Shopify Admin
 * REST/GraphQL Order resource. We intentionally only include the
 * fields the SDK reads — Shopify returns many more, which are
 * preserved untouched on `metadata`.
 */

/** Supported stablecoin currencies on BlockPay. */
export type BlockPayCurrency = "USDC" | "EURC";

/** Supported on-chain networks. */
export type BlockPayChainKey =
  | "ethereum"
  | "base"
  | "base-sepolia"
  | "polygon"
  | "arbitrum"
  | "optimism";

/** Lifecycle of a BlockPay invoice. */
export type BlockPayInvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "expired"
  | "cancelled";

/**
 * Minimal Shopify storefront `/cart.js` line-item shape.
 *
 * Shopify returns money values as integer minor units (cents). We
 * keep that contract here so callers can pass the parsed JSON
 * straight through without re-shaping it.
 */
export interface ShopifyLineItem {
  /** Shopify variant id. */
  id: number | string;
  /** Quantity ordered. */
  quantity: number;
  /** Human title rendered on the cart. */
  title: string;
  /** Per-item price in minor units (e.g. cents). */
  price: number;
  /** Line total (price * quantity) in minor units. */
  line_price: number;
  /** ISO 4217 currency code, e.g. "USD". */
  currency?: string;
  /** Storefront-rendered variant title, optional. */
  variant_title?: string | null;
  /** Product handle (slug). */
  handle?: string;
  /** Storefront product URL. */
  url?: string;
}

/**
 * Minimal Shopify storefront `/cart.js` cart shape.
 *
 * Maps 1:1 to https://shopify.dev/docs/api/ajax/reference/cart (read).
 */
export interface ShopifyCart {
  /** Shopify cart token. */
  token: string;
  /** Storefront note, if any. */
  note?: string | null;
  /** Optional cart attributes — free-form key/value pairs. */
  attributes?: Record<string, string>;
  /** Sum of all line items in minor units. */
  total_price: number;
  /** Shopify currency code, e.g. "USD". */
  currency: string;
  /** Line items in display order. */
  items: ShopifyLineItem[];
  /** Total item count. */
  item_count: number;
}

/**
 * Minimal Shopify Admin order line-item shape.
 *
 * Compatible with both the REST Order resource and the GraphQL
 * `LineItem` node — both return prices as decimal strings.
 */
export interface ShopifyOrderLineItem {
  /** Shopify line-item id. */
  id: number | string;
  /** Storefront product title. */
  title: string;
  /** Quantity ordered. */
  quantity: number;
  /** Decimal-string per-item price, e.g. "9.99". */
  price: string;
  /** Optional variant title. */
  variant_title?: string | null;
  /** Optional SKU. */
  sku?: string | null;
}

/**
 * Minimal Shopify Admin Order resource.
 *
 * Includes only fields used by the SDK. All others can be passed
 * through unchanged on the input — they're ignored.
 */
export interface ShopifyOrder {
  /** Shopify order id. */
  id: number | string;
  /** Human-facing order name, e.g. "#1001". */
  name?: string;
  /** ISO 4217 currency code of the order. */
  currency: string;
  /** Decimal-string grand total, e.g. "49.50". */
  total_price: string;
  /** Customer email if known. */
  email?: string | null;
  /** Line items on the order. */
  line_items: ShopifyOrderLineItem[];
  /** Free-form metadata: tags, note, etc. */
  note?: string | null;
  /** Shop sub-domain, e.g. "demo.myshopify.com". */
  shop_domain?: string;
}

/** Shape of a BlockPay invoice returned by the API. */
export interface BlockPayInvoice {
  id: string;
  merchantId: string;
  label: string;
  amount: string;
  currency: BlockPayCurrency;
  chainKey: BlockPayChainKey;
  status: BlockPayInvoiceStatus;
  description?: string;
  metadata?: Record<string, string>;
  checkoutUrl: string;
  paymentTxHash?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
}

/** Common BlockPay webhook event names. */
export type BlockPayEventName =
  | "invoice.paid"
  | "invoice.expired"
  | "invoice.cancelled"
  | "payment.received"
  | "payment_link.used";

/** A BlockPay webhook event envelope. */
export interface BlockPayEvent<T = BlockPayInvoice> {
  /** Event name, e.g. "invoice.paid". */
  event: BlockPayEventName | string;
  /** Unix-seconds delivery timestamp. */
  deliveredAt: number;
  /** Event payload — almost always the invoice that changed. */
  data: T;
}

/**
 * Options accepted when converting a Shopify cart or order into a
 * BlockPay invoice. The defaults reflect what most merchants want.
 */
export interface CartConversionOptions {
  /** Stablecoin to charge. Defaults to USDC. */
  currency?: BlockPayCurrency;
  /** Chain to settle on. Defaults to "base". */
  chainKey?: BlockPayChainKey;
  /** Override the invoice label. Defaults to "Shopify cart". */
  label?: string;
  /** Optional human description rendered on the checkout page. */
  description?: string;
  /** Where to redirect the payer once payment succeeds. */
  successUrl?: string;
  /** Where to redirect if the payer cancels. */
  cancelUrl?: string;
  /** Optional ISO-8601 expiry timestamp. */
  expiresAt?: string;
  /** Extra metadata merged into the invoice metadata bag. */
  metadata?: Record<string, string>;
}

/** Map from a Shopify shop currency to a BlockPay currency. */
export type CurrencyMap = Partial<Record<string, BlockPayCurrency>>;
