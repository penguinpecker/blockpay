/**
 * Browser entry — drop-in `<script src="...">` widget that mounts an
 * embedded BlockPay checkout iframe inside the host page.
 *
 * ```html
 * <div id="bp-checkout"></div>
 * <script src="https://unpkg.com/@blockpay/checkout/dist/index.browser.js"></script>
 * <script>
 *   BlockPayCheckout.mount({
 *     elementId: "bp-checkout",
 *     invoiceId: "inv_123",
 *     onSuccess: (receipt) => console.log("paid", receipt),
 *   });
 * </script>
 * ```
 */

import { DEFAULT_BASE_URL } from "./transport.js";
import type { SignedReceipt } from "./types.js";

export interface MountOptions {
  /** ID of the element the iframe will be appended to. */
  elementId: string;
  /** The BlockPay invoice id to render. */
  invoiceId: string;
  /** Override the BlockPay host (rarely needed). */
  baseUrl?: string;
  /** Iframe width. Defaults to 100%. */
  width?: string;
  /** Iframe height. Defaults to 640px. */
  height?: string;
  /** Called once the payer completes the checkout. */
  onSuccess?: (receipt: SignedReceipt) => void;
  /** Called if the payer cancels or closes the checkout. */
  onCancel?: () => void;
  /** Called when the iframe reports an error. */
  onError?: (err: { code: string; message: string }) => void;
}

/** Handle returned by `mount()` so callers can tear the widget down. */
export interface MountHandle {
  iframe: HTMLIFrameElement;
  destroy: () => void;
}

interface IframeMessage {
  source: "blockpay";
  type: "success" | "cancel" | "error";
  invoiceId: string;
  receipt?: SignedReceipt;
  error?: { code: string; message: string };
}

function isBlockPayMessage(data: unknown): data is IframeMessage {
  if (!data || typeof data !== "object") return false;
  const d = data as Partial<IframeMessage>;
  return (
    d.source === "blockpay" &&
    typeof d.type === "string" &&
    typeof d.invoiceId === "string"
  );
}

/**
 * Mount an iframe-based BlockPay checkout into the page.
 *
 * Returns a handle whose `destroy()` removes the iframe and the
 * message listener — call this on route change to avoid leaks.
 */
export function mount(opts: MountOptions): MountHandle {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("BlockPay.mount() must be called in a browser environment");
  }
  const host = document.getElementById(opts.elementId);
  if (!host) {
    throw new Error(
      `BlockPay.mount: no element with id "${opts.elementId}" found`,
    );
  }

  const baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const expectedOrigin = new URL(baseUrl).origin;

  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}/checkout/${encodeURIComponent(opts.invoiceId)}?embed=1`;
  iframe.title = "BlockPay checkout";
  iframe.style.border = "0";
  iframe.style.width = opts.width ?? "100%";
  iframe.style.height = opts.height ?? "640px";
  iframe.style.display = "block";
  iframe.allow = "payment; clipboard-write";
  iframe.setAttribute("referrerpolicy", "origin");

  host.appendChild(iframe);

  function onMessage(event: MessageEvent): void {
    if (event.origin !== expectedOrigin) return;
    if (!isBlockPayMessage(event.data)) return;
    if (event.data.invoiceId !== opts.invoiceId) return;

    switch (event.data.type) {
      case "success":
        if (event.data.receipt) opts.onSuccess?.(event.data.receipt);
        break;
      case "cancel":
        opts.onCancel?.();
        break;
      case "error":
        if (event.data.error) opts.onError?.(event.data.error);
        break;
    }
  }

  window.addEventListener("message", onMessage);

  return {
    iframe,
    destroy(): void {
      window.removeEventListener("message", onMessage);
      iframe.remove();
    },
  };
}

/**
 * Namespaced object suitable for `window.BlockPayCheckout`. The build
 * does not assign it automatically — host pages can do so explicitly
 * via `window.BlockPayCheckout = BlockPayCheckout`.
 */
export const BlockPayCheckout = { mount };

export default BlockPayCheckout;
