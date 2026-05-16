/**
 * `ThemeClient` — browser-side helper for Shopify theme integrations.
 *
 * Given a Shopify cart (the JSON returned by `/cart.js`), this client
 * creates a BlockPay invoice and either redirects the customer to the
 * BlockPay checkout page, or renders a button that does so on click.
 *
 * Designed to work *without* a Shopify App: drop the bundled
 * `theme.browser.js` into your theme, expose your **publishable** key
 * via a theme setting, and the cart-to-invoice flow works.
 */

import type {
  BlockPayCurrency,
  BlockPayChainKey,
  BlockPayInvoice,
  CartConversionOptions,
  ShopifyCart,
  ShopifyLineItem,
} from "./types.js";

export type { ShopifyCart, ShopifyLineItem };

/** Default API host. Match what `@blockpay/checkout` uses. */
export const DEFAULT_API_BASE_URL = "https://blockpay-six.vercel.app";

/** Options accepted when constructing a `ThemeClient`. */
export interface ThemeClientOptions {
  /**
   * A BlockPay **publishable** key. This is the only credential that
   * is safe to expose in a Shopify theme — never use a secret key in
   * the storefront.
   */
  apiKey: string;
  /** Shopify shop domain, e.g. "demo.myshopify.com". */
  shopDomain: string;
  /** Override the API base URL. */
  baseUrl?: string;
  /** Override fetch (handy for tests). */
  fetch?: typeof fetch;
  /** Default conversion options applied to every cart-to-invoice call. */
  defaults?: CartConversionOptions;
}

/** Return value of `cartToInvoice()`. */
export interface CartToInvoiceResult {
  /** The created invoice id. */
  invoiceId: string;
  /** Public payer-facing checkout URL — redirect the customer here. */
  checkoutUrl: string;
  /** Full invoice record for callers that need it. */
  invoice: BlockPayInvoice;
}

/** Options for `renderPayButton()`. */
export interface RenderPayButtonOptions {
  /** Host element the button is mounted into. */
  container: HTMLElement;
  /**
   * Cart to convert when the button is clicked. May be either a
   * `ShopifyCart` object or a thunk that fetches the latest cart.
   */
  cart: ShopifyCart | (() => Promise<ShopifyCart> | ShopifyCart);
  /** Button label. Defaults to "Pay with crypto via BlockPay". */
  label?: string;
  /** Per-button conversion overrides. */
  conversion?: CartConversionOptions;
  /**
   * Called when the user clicks. Return `false` (or call
   * `event.preventDefault()`) to abort the conversion.
   */
  onClick?: (event: MouseEvent) => boolean | void | Promise<boolean | void>;
  /**
   * Called once the invoice is created. Default behaviour is to
   * `window.location.assign(checkoutUrl)`. Override to open in a new
   * tab or to render the embedded iframe widget instead.
   */
  onCreated?: (result: CartToInvoiceResult) => void;
  /** Called if invoice creation fails. */
  onError?: (err: Error) => void;
}

/** Handle returned from `renderPayButton()`. */
export interface PayButtonHandle {
  button: HTMLButtonElement;
  destroy: () => void;
}

/**
 * Convert a Shopify storefront cart total (minor units) into a
 * decimal-string suitable for the BlockPay API.
 *
 * Shopify always returns prices in *minor* units (e.g. cents) so we
 * divide by 100. Special-cased here so callers don't have to.
 */
export function shopifyMinorUnitsToDecimalString(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(
      `shopifyMinorUnitsToDecimalString: invalid amount ${amount}`,
    );
  }
  const whole = Math.floor(amount / 100);
  const cents = Math.round(amount % 100);
  return `${whole}.${cents.toString().padStart(2, "0")}`;
}

const SHOP_TO_BLOCKPAY_CURRENCY: Record<string, BlockPayCurrency> = {
  USD: "USDC",
  EUR: "EURC",
};

/** Pick a sensible BlockPay currency given the Shopify currency code. */
export function defaultCurrencyFor(shopifyCurrency: string): BlockPayCurrency {
  return SHOP_TO_BLOCKPAY_CURRENCY[shopifyCurrency.toUpperCase()] ?? "USDC";
}

/**
 * Build the request body sent to `POST /api/v1/invoices` for a given
 * Shopify cart. Exposed so callers can inspect/modify the payload
 * before it hits the wire.
 */
export function buildInvoicePayloadFromCart(
  cart: ShopifyCart,
  opts: CartConversionOptions & { shopDomain: string },
): Record<string, unknown> {
  if (!cart || typeof cart !== "object") {
    throw new Error("buildInvoicePayloadFromCart: cart is required");
  }
  if (!Array.isArray(cart.items) || cart.items.length === 0) {
    throw new Error("buildInvoicePayloadFromCart: cart has no items");
  }

  const currency: BlockPayCurrency =
    opts.currency ?? defaultCurrencyFor(cart.currency);
  const chainKey: BlockPayChainKey = opts.chainKey ?? "base";
  const amount = shopifyMinorUnitsToDecimalString(cart.total_price);

  const label =
    opts.label ?? `Shopify cart (${cart.item_count} item${cart.item_count === 1 ? "" : "s"})`;

  return {
    label,
    amount,
    currency,
    chainKey,
    description: opts.description,
    successUrl: opts.successUrl,
    cancelUrl: opts.cancelUrl,
    expiresAt: opts.expiresAt,
    lineItems: cart.items.map((item) => ({
      description:
        item.variant_title && item.variant_title.length > 0
          ? `${item.title} (${item.variant_title})`
          : item.title,
      unitAmount: shopifyMinorUnitsToDecimalString(item.price),
      quantity: item.quantity,
    })),
    metadata: {
      source: "shopify-theme",
      shop_domain: opts.shopDomain,
      shopify_cart_token: cart.token,
      shopify_currency: cart.currency,
      ...(opts.metadata ?? {}),
    },
  };
}

/**
 * Browser-friendly client used inside a Shopify theme.
 */
export class ThemeClient {
  private readonly apiKey: string;
  private readonly shopDomain: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaults: CartConversionOptions;

  constructor(opts: ThemeClientOptions) {
    if (!opts.apiKey) {
      throw new Error("ThemeClient: apiKey is required");
    }
    if (!opts.shopDomain) {
      throw new Error("ThemeClient: shopDomain is required");
    }
    this.apiKey = opts.apiKey;
    this.shopDomain = opts.shopDomain;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
    this.fetchImpl =
      opts.fetch ??
      (typeof fetch !== "undefined"
        ? fetch.bind(globalThis)
        : ((() => {
            throw new Error(
              "ThemeClient: no fetch implementation available in this runtime",
            );
          }) as typeof fetch));
    this.defaults = opts.defaults ?? {};
  }

  /**
   * Convert a Shopify cart into a BlockPay invoice.
   *
   * Returns the `checkoutUrl` you should redirect the customer to,
   * plus the full invoice record.
   */
  async cartToInvoice(
    cart: ShopifyCart,
    conversion: CartConversionOptions = {},
  ): Promise<CartToInvoiceResult> {
    const payload = buildInvoicePayloadFromCart(cart, {
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
        "X-Blockpay-Source": "shopify-theme",
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
    return {
      invoiceId: invoice.id,
      checkoutUrl: invoice.checkoutUrl,
      invoice,
    };
  }

  /**
   * Render a "Pay with crypto via BlockPay" button into `container`.
   *
   * Default click behaviour: fetch the current cart (or use the one
   * passed in), call `cartToInvoice()`, and `window.location.assign`
   * the `checkoutUrl`. Override with `onCreated` to use an iframe
   * widget instead.
   */
  renderPayButton(opts: RenderPayButtonOptions): PayButtonHandle {
    if (typeof document === "undefined") {
      throw new Error("renderPayButton must be called in a browser");
    }
    if (!opts.container || !(opts.container instanceof HTMLElement)) {
      throw new Error("renderPayButton: opts.container must be an HTMLElement");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = opts.label ?? "Pay with crypto via BlockPay";
    button.setAttribute("data-blockpay", "pay-button");
    applyButtonStyles(button);

    const clickHandler = async (event: MouseEvent): Promise<void> => {
      if (opts.onClick) {
        const result = await opts.onClick(event);
        if (result === false || event.defaultPrevented) return;
      }
      if (button.disabled) return;

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Creating invoice...";

      try {
        const cart =
          typeof opts.cart === "function" ? await opts.cart() : opts.cart;
        const result = await this.cartToInvoice(cart, opts.conversion);
        if (opts.onCreated) {
          opts.onCreated(result);
        } else if (typeof window !== "undefined") {
          window.location.assign(result.checkoutUrl);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown BlockPay error");
        if (opts.onError) {
          opts.onError(error);
        } else {
          console.error("[BlockPay]", error);
        }
        button.disabled = false;
        button.textContent = originalText;
      }
    };

    button.addEventListener("click", clickHandler);
    opts.container.appendChild(button);

    return {
      button,
      destroy(): void {
        button.removeEventListener("click", clickHandler);
        button.remove();
      },
    };
  }
}

/** Apply the default visual styling to the pay button. */
function applyButtonStyles(button: HTMLButtonElement): void {
  const s = button.style;
  s.display = "inline-flex";
  s.alignItems = "center";
  s.justifyContent = "center";
  s.gap = "8px";
  s.padding = "12px 20px";
  s.fontSize = "16px";
  s.fontWeight = "600";
  s.borderRadius = "8px";
  s.border = "0";
  s.cursor = "pointer";
  s.background = "linear-gradient(135deg, #4f46e5, #06b6d4)";
  s.color = "#ffffff";
  s.fontFamily =
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
