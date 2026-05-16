/**
 * `@blockpay/shopify` — official BlockPay SDK for Shopify themes and apps.
 *
 * ```ts
 * import { BlockPayShopify } from "@blockpay/shopify";
 *
 * const bp = new BlockPayShopify({
 *   apiKey: process.env.BLOCKPAY_API_KEY!,
 *   shopDomain: "demo.myshopify.com",
 *   webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET,
 * });
 *
 * // Server side — convert a Shopify Admin order into a BlockPay invoice.
 * const invoice = await bp.app.syncOrderToInvoice(order);
 *
 * // Webhook bridge — verify a delivery from BlockPay.
 * const ok = await bp.webhooks.verify({ rawBody, signature });
 * ```
 *
 * For browser-only usage (a Shopify theme), import the `./theme`
 * entry directly or load the bundled IIFE from `./theme/browser`.
 */

import { AppClient, type AppClientOptions } from "./app.js";
import { ThemeClient, type ThemeClientOptions } from "./theme.js";
import {
  WebhookBridge,
  type WebhookBridgeOptions,
} from "./webhooks.js";

/** Constructor options accepted by `BlockPayShopify`. */
export interface BlockPayShopifyOptions {
  /** BlockPay API key. */
  apiKey: string;
  /** Shopify shop domain, e.g. "demo.myshopify.com". */
  shopDomain: string;
  /** Per-endpoint BlockPay webhook signing secret. */
  webhookSecret?: string;
  /** Override the BlockPay API base URL. */
  baseUrl?: string;
  /** Custom fetch implementation (handy for tests). */
  fetch?: typeof fetch;
  /** Theme-specific overrides forwarded to `ThemeClient`. */
  theme?: Omit<ThemeClientOptions, "apiKey" | "shopDomain" | "fetch" | "baseUrl">;
  /** App-specific overrides forwarded to `AppClient`. */
  app?: Omit<AppClientOptions, "apiKey" | "shopDomain" | "fetch" | "baseUrl">;
  /** Webhook bridge overrides. */
  webhooks?: Omit<WebhookBridgeOptions, "secret">;
}

/**
 * Top-level BlockPay client for Shopify.
 *
 * Wires together the three sub-clients: `theme` (browser),
 * `app` (server) and `webhooks` (signature bridge).
 */
export class BlockPayShopify {
  public readonly theme: ThemeClient;
  public readonly app: AppClient;
  public readonly webhooks: WebhookBridge;

  constructor(opts: BlockPayShopifyOptions) {
    if (!opts.apiKey) {
      throw new Error("BlockPayShopify: apiKey is required");
    }
    if (!opts.shopDomain) {
      throw new Error("BlockPayShopify: shopDomain is required");
    }
    this.theme = new ThemeClient({
      apiKey: opts.apiKey,
      shopDomain: opts.shopDomain,
      baseUrl: opts.baseUrl,
      fetch: opts.fetch,
      ...opts.theme,
    });
    this.app = new AppClient({
      apiKey: opts.apiKey,
      shopDomain: opts.shopDomain,
      baseUrl: opts.baseUrl,
      fetch: opts.fetch,
      ...opts.app,
    });
    this.webhooks = new WebhookBridge({
      secret: opts.webhookSecret,
      ...opts.webhooks,
    });
  }
}

export default BlockPayShopify;

// Re-exports so consumers can name-import sub-clients and helpers.
export { ThemeClient, buildInvoicePayloadFromCart, shopifyMinorUnitsToDecimalString, defaultCurrencyFor, DEFAULT_API_BASE_URL } from "./theme.js";
export { AppClient, buildInvoicePayloadFromOrder, defaultCurrencyForShopifyCode } from "./app.js";
export { WebhookBridge, parseSignatureHeader, timingSafeEqualHex } from "./webhooks.js";

export type {
  ThemeClientOptions,
  CartToInvoiceResult,
  RenderPayButtonOptions,
  PayButtonHandle,
} from "./theme.js";
export type {
  AppClientOptions,
  MarkOrderPaidOptions,
  MarkOrderPaidResult,
} from "./app.js";
export type {
  WebhookBridgeOptions,
  WebhookHandlers,
  VerifyInput,
  PeerVerifier,
} from "./webhooks.js";

export type {
  BlockPayCurrency,
  BlockPayChainKey,
  BlockPayInvoiceStatus,
  BlockPayInvoice,
  BlockPayEvent,
  BlockPayEventName,
  ShopifyCart,
  ShopifyLineItem,
  ShopifyOrder,
  ShopifyOrderLineItem,
  CartConversionOptions,
  CurrencyMap,
} from "./types.js";
