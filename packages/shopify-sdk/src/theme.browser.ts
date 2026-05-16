/**
 * Browser-only entry for Shopify theme integrations.
 *
 * Designed for a no-bundler workflow: drop a `<script>` tag into
 * `theme.liquid`, then invoke `BlockPayShopify.mount(...)` from a
 * Liquid snippet.
 *
 * ```html
 * <script src="https://unpkg.com/@blockpay/shopify/dist/theme.browser.js"></script>
 * <script>
 *   BlockPayShopify.mount({
 *     elementId: "blockpay-cart-button",
 *     apiKey: "{{ settings.blockpay_publishable_key }}",
 *     shopDomain: "{{ shop.permanent_domain }}",
 *   });
 * </script>
 * ```
 */

import {
  ThemeClient,
  type ThemeClientOptions,
  type RenderPayButtonOptions,
  type CartToInvoiceResult,
} from "./theme.js";
import type { ShopifyCart, CartConversionOptions } from "./types.js";

/** Options accepted by the script-tag `mount()` factory. */
export interface BrowserMountOptions
  extends Omit<ThemeClientOptions, "fetch"> {
  /**
   * ID of the host element. If absent, the button is appended to
   * `document.body` and the caller is expected to position it via
   * CSS — most themes should set this.
   */
  elementId?: string;
  /** Button label. Defaults to "Pay with crypto via BlockPay". */
  label?: string;
  /**
   * Optional cart fetcher. By default the script hits
   * `/cart.js` on the same origin — which is what every Shopify
   * storefront serves.
   */
  fetchCart?: () => Promise<ShopifyCart>;
  /** Per-button conversion overrides. */
  conversion?: CartConversionOptions;
  /** Override the default redirect-to-checkout behaviour. */
  onCreated?: RenderPayButtonOptions["onCreated"];
  /** Called if invoice creation fails. */
  onError?: RenderPayButtonOptions["onError"];
}

/** Default cart fetcher — hits Shopify's `/cart.js`. */
async function defaultFetchCart(): Promise<ShopifyCart> {
  if (typeof fetch === "undefined") {
    throw new Error("BlockPayShopify: no fetch available in this runtime");
  }
  const res = await fetch("/cart.js", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(
      `BlockPayShopify: /cart.js fetch failed (${res.status})`,
    );
  }
  return (await res.json()) as ShopifyCart;
}

/**
 * Mount a pay button into a Shopify theme. Returns a handle whose
 * `destroy()` removes the button — useful on Shopify section reloads.
 */
export function mount(opts: BrowserMountOptions): {
  destroy(): void;
  button: HTMLButtonElement;
} {
  if (typeof document === "undefined") {
    throw new Error("BlockPayShopify.mount must be called in a browser");
  }
  const container = opts.elementId
    ? document.getElementById(opts.elementId)
    : document.body;
  if (!container) {
    throw new Error(
      `BlockPayShopify.mount: no element with id "${opts.elementId}" found`,
    );
  }

  const client = new ThemeClient({
    apiKey: opts.apiKey,
    shopDomain: opts.shopDomain,
    baseUrl: opts.baseUrl,
    defaults: opts.defaults,
  });

  const cartLoader = opts.fetchCart ?? defaultFetchCart;

  const handle = client.renderPayButton({
    container: container as HTMLElement,
    cart: cartLoader,
    label: opts.label,
    conversion: opts.conversion,
    onCreated: opts.onCreated,
    onError: opts.onError,
  });

  return handle;
}

/**
 * Render the button directly into an existing element without
 * fetching the cart for the caller — handy when the theme already
 * has the cart JSON in scope (e.g. from a Liquid `{{ cart | json }}`).
 */
export function mountWithCart(opts: {
  container: HTMLElement;
  cart: ShopifyCart;
  apiKey: string;
  shopDomain: string;
  baseUrl?: string;
  label?: string;
  conversion?: CartConversionOptions;
  onCreated?: (r: CartToInvoiceResult) => void;
  onError?: (err: Error) => void;
}): {
  destroy(): void;
  button: HTMLButtonElement;
} {
  const client = new ThemeClient({
    apiKey: opts.apiKey,
    shopDomain: opts.shopDomain,
    baseUrl: opts.baseUrl,
  });
  return client.renderPayButton({
    container: opts.container,
    cart: opts.cart,
    label: opts.label,
    conversion: opts.conversion,
    onCreated: opts.onCreated,
    onError: opts.onError,
  });
}

/** Namespaced global suitable for `window.BlockPayShopify`. */
export const BlockPayShopify = { mount, mountWithCart, ThemeClient };

export default BlockPayShopify;

// When loaded as a classic <script> the global is automatically
// installed. ESM consumers can ignore this side-effect.
if (typeof window !== "undefined") {
  (window as unknown as { BlockPayShopify?: unknown }).BlockPayShopify ??=
    BlockPayShopify;
}
