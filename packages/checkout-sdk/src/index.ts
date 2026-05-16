/**
 * @blockpay/checkout — official JavaScript / TypeScript SDK
 *
 * ```ts
 * import BlockPay from "@blockpay/checkout";
 *
 * const bp = new BlockPay({ apiKey: process.env.BLOCKPAY_API_KEY! });
 *
 * const invoice = await bp.invoices.create({
 *   label: "Pro plan – monthly",
 *   amount: "29.00",
 *   currency: "USDC",
 *   chainKey: "base",
 * });
 *
 * console.log(invoice.checkoutUrl);
 * ```
 */

import { InvoicesModule } from "./invoices.js";
import { PaymentLinksModule } from "./payment-links.js";
import { ReceiptsModule } from "./receipts.js";
import { Transport } from "./transport.js";
import { WebhooksModule } from "./webhooks.js";

export interface BlockPayOptions {
  /** Server-issued secret key. Treat like a password — never ship to the browser. */
  apiKey: string;
  /** Override the API base URL. Defaults to the BlockPay production URL. */
  baseUrl?: string;
  /** Custom fetch implementation (e.g. for testing). */
  fetch?: typeof fetch;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
}

/**
 * Main BlockPay client. Construct once and reuse — modules are stateless.
 */
export class BlockPay {
  public readonly invoices: InvoicesModule;
  public readonly paymentLinks: PaymentLinksModule;
  public readonly webhooks: WebhooksModule;
  public readonly receipts: ReceiptsModule;

  /** Underlying transport — exposed for advanced use, but prefer modules. */
  public readonly transport: Transport;

  constructor(opts: BlockPayOptions) {
    this.transport = new Transport({
      apiKey: opts.apiKey,
      baseUrl: opts.baseUrl,
      fetch: opts.fetch,
      headers: opts.headers,
    });
    this.invoices = new InvoicesModule(this.transport);
    this.paymentLinks = new PaymentLinksModule(this.transport);
    this.webhooks = new WebhooksModule();
    this.receipts = new ReceiptsModule();
  }
}

export default BlockPay;

// Re-export module classes and types so consumers can name-import.
export { InvoicesModule } from "./invoices.js";
export { PaymentLinksModule } from "./payment-links.js";
export { WebhooksModule } from "./webhooks.js";
export { ReceiptsModule, RECEIPT_TYPES } from "./receipts.js";
export {
  Transport,
  BlockPayError,
  DEFAULT_BASE_URL,
  buildUrl,
} from "./transport.js";

export type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  ListInvoicesFilter,
} from "./invoices.js";
export type {
  CreatePaymentLinkInput,
  PaymentLink,
} from "./payment-links.js";
export type {
  VerifyWebhookInput,
  ParseWebhookInput,
} from "./webhooks.js";
export type {
  VerifyReceiptInput,
  Receipt,
  ReceiptDomain,
  SignedReceipt,
} from "./receipts.js";
export type {
  TransportOptions,
  RequestOptions,
  ErrorPayload,
} from "./transport.js";
export type {
  ChainKey,
  Currency,
  LineItem,
  WebhookEvent,
} from "./types.js";
