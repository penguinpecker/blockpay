/**
 * Shared types used across the BlockPay SDK.
 *
 * These mirror the public REST API contracts at
 * https://blockpay-six.vercel.app/docs/api
 */

/** Supported stablecoin currencies. */
export type Currency = "USDC" | "EURC";

/**
 * Identifier of the on-chain network the invoice/payment-link lives on.
 * BlockPay exposes them as string keys to keep the API readable.
 */
export type ChainKey =
  | "ethereum"
  | "base"
  | "base-sepolia"
  | "polygon"
  | "arbitrum"
  | "optimism";

/** Lifecycle state of an invoice. */
export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "expired"
  | "cancelled";

/** Single billable item attached to an invoice. */
export interface LineItem {
  description: string;
  /** Decimal string of the unit price in the invoice currency, e.g. "9.99". */
  unitAmount: string;
  quantity: number;
}

/** Input accepted by `invoices.create()`. */
export interface CreateInvoiceInput {
  /** Display label shown to the payer. */
  label: string;
  /** Total decimal amount, e.g. "49.50". */
  amount: string;
  currency: Currency;
  chainKey: ChainKey;
  /** Optional human description rendered on the checkout page. */
  description?: string;
  /** Optional list of itemised charges. */
  lineItems?: LineItem[];
  /** Free-form metadata stored alongside the invoice. */
  metadata?: Record<string, string>;
  /** ISO-8601 UTC string. Invoice transitions to "expired" after this. */
  expiresAt?: string;
  /** Where the payer is redirected after a successful payment. */
  successUrl?: string;
  /** Where the payer is redirected if they cancel. */
  cancelUrl?: string;
}

/** Materialised invoice returned by the API. */
export interface Invoice {
  id: string;
  merchantId: string;
  label: string;
  amount: string;
  currency: Currency;
  chainKey: ChainKey;
  status: InvoiceStatus;
  description?: string;
  lineItems?: LineItem[];
  metadata?: Record<string, string>;
  /** Public, payer-facing checkout URL. */
  checkoutUrl: string;
  /** On-chain transaction hash once the invoice is paid. */
  paymentTxHash?: `0x${string}`;
  /** Wallet address that paid the invoice. */
  paidBy?: `0x${string}`;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
}

/** Reusable payment link surface. */
export interface PaymentLink {
  id: string;
  merchantId: string;
  label: string;
  amount: string;
  currency: Currency;
  chainKey: ChainKey;
  description?: string;
  /** Public-facing URL payers visit. */
  url: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * EIP-712 typed-data domain used to sign BlockPay receipts.
 */
export interface ReceiptDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

/**
 * Unsigned receipt payload — the canonical record of a paid invoice.
 */
export interface Receipt {
  invoiceId: string;
  merchant: `0x${string}`;
  payer: `0x${string}`;
  amount: string;
  currency: Currency;
  chainId: number;
  txHash: `0x${string}`;
  /** Unix seconds. */
  paidAt: number;
  /** Random nonce, prevents replay. */
  nonce: `0x${string}`;
}

/** Receipt plus the merchant signature. */
export interface SignedReceipt {
  domain: ReceiptDomain;
  receipt: Receipt;
  signature: `0x${string}`;
}

/** Event delivered to a webhook endpoint. */
export interface WebhookEvent<T = unknown> {
  /** e.g. "invoice.paid", "invoice.expired", "payment_link.used" */
  event: string;
  /** Unix-seconds delivery timestamp. */
  deliveredAt: number;
  data: T;
}
