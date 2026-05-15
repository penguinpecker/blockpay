/**
 * BlockPay storage layer.
 *
 * Defines the canonical Storage interface used by every API route handler
 * and the on-chain event indexer. The in-memory implementation below is
 * good enough for local dev and preview deployments. In production this
 * should be swapped for a durable backend.
 *
 * TODO(prod): replace the in-memory Maps with Vercel KV (@vercel/kv) or
 * Upstash Redis. The Storage interface is intentionally narrow so the
 * swap is a single-file change.
 */

import type { ChainKey } from "./contracts";

// ---- Domain types ----

export type InvoiceStatus = "draft" | "open" | "paid" | "expired" | "void";

export type LineItem = {
  label: string;
  amount: string;
};

export type InvoiceInput = {
  merchantId: string;
  merchantAddress: `0x${string}`;
  /** Amount in token base units (e.g. USDC has 6 decimals). */
  amount: string;
  currency: "USDC" | "EURC";
  chainKey: ChainKey;
  lineItems: LineItem[];
  memoCid?: `0x${string}`;
  expiresAt?: number;
};

export type Invoice = {
  id: string;
  onChainInvoiceId: `0x${string}`;
  merchantId: string;
  merchantAddress: `0x${string}`;
  amount: string;
  currency: "USDC" | "EURC";
  chainKey: ChainKey;
  lineItems: LineItem[];
  memoCid?: `0x${string}`;
  expiresAt?: number;
  status: InvoiceStatus;
  createdAt: number;
  updatedAt: number;
  settlement?: SettlementRecord;
};

export type SettlementRecord = {
  txHash: `0x${string}`;
  blockNumber: number;
  logIndex: number;
  payer: `0x${string}`;
  amount: string;
  feeAmount: string;
  settledAt: number;
};

export type PaymentRecord = {
  /** Stable id: `${chainKey}:${txHash}:${logIndex}` */
  id: string;
  chainKey: ChainKey;
  onChainInvoiceId: `0x${string}`;
  invoiceId?: string;
  merchantId?: string;
  merchantAddress: `0x${string}`;
  payer: `0x${string}`;
  token: `0x${string}`;
  amount: string;
  feeAmount: string;
  memoCid: `0x${string}`;
  txHash: `0x${string}`;
  blockNumber: number;
  logIndex: number;
  recordedAt: number;
};

// ---- Interface ----

export interface Storage {
  invoices: {
    create(input: InvoiceInput): Promise<Invoice>;
    get(id: string): Promise<Invoice | null>;
    getByOnChainId(invoiceIdHex: `0x${string}`): Promise<Invoice | null>;
    list(filter?: {
      merchantId?: string;
      status?: InvoiceStatus;
    }): Promise<Invoice[]>;
    updateStatus(
      id: string,
      status: InvoiceStatus,
      settlement?: SettlementRecord,
    ): Promise<Invoice>;
  };
  payments: {
    record(p: PaymentRecord): Promise<PaymentRecord>;
    list(filter?: {
      merchantId?: string;
      chainKey?: ChainKey;
    }): Promise<PaymentRecord[]>;
    has(id: string): Promise<boolean>;
  };
}

// ---- In-memory implementation ----
//
// Module-level Maps. Survives across HMR in dev because of the
// globalThis cache below. In production this resets on every cold start,
// which is fine because this is meant as a placeholder.

type Globals = typeof globalThis & {
  __blockpayInvoices?: Map<string, Invoice>;
  __blockpayInvoicesByOnChain?: Map<string, string>; // onChainId -> id
  __blockpayPayments?: Map<string, PaymentRecord>;
};

const g = globalThis as Globals;

const invoicesById: Map<string, Invoice> =
  g.__blockpayInvoices ?? new Map<string, Invoice>();
const invoicesByOnChain: Map<string, string> =
  g.__blockpayInvoicesByOnChain ?? new Map<string, string>();
const paymentsById: Map<string, PaymentRecord> =
  g.__blockpayPayments ?? new Map<string, PaymentRecord>();

g.__blockpayInvoices = invoicesById;
g.__blockpayInvoicesByOnChain = invoicesByOnChain;
g.__blockpayPayments = paymentsById;

function randomId(prefix: string): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${prefix}_${hex}`;
}

function randomOnChainInvoiceId(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  )}` as `0x${string}`;
}

export const storage: Storage = {
  invoices: {
    async create(input: InvoiceInput): Promise<Invoice> {
      const now = Date.now();
      const id = randomId("inv");
      const onChainInvoiceId = randomOnChainInvoiceId();
      const invoice: Invoice = {
        id,
        onChainInvoiceId,
        merchantId: input.merchantId,
        merchantAddress: input.merchantAddress,
        amount: input.amount,
        currency: input.currency,
        chainKey: input.chainKey,
        lineItems: input.lineItems,
        memoCid: input.memoCid,
        expiresAt: input.expiresAt,
        status: "open",
        createdAt: now,
        updatedAt: now,
      };
      invoicesById.set(id, invoice);
      invoicesByOnChain.set(onChainInvoiceId.toLowerCase(), id);
      return invoice;
    },

    async get(id: string): Promise<Invoice | null> {
      return invoicesById.get(id) ?? null;
    },

    async getByOnChainId(
      invoiceIdHex: `0x${string}`,
    ): Promise<Invoice | null> {
      const id = invoicesByOnChain.get(invoiceIdHex.toLowerCase());
      if (!id) return null;
      return invoicesById.get(id) ?? null;
    },

    async list(filter?: {
      merchantId?: string;
      status?: InvoiceStatus;
    }): Promise<Invoice[]> {
      const all = Array.from(invoicesById.values());
      const filtered = all.filter((inv) => {
        if (filter?.merchantId && inv.merchantId !== filter.merchantId)
          return false;
        if (filter?.status && inv.status !== filter.status) return false;
        return true;
      });
      filtered.sort((a, b) => b.createdAt - a.createdAt);
      return filtered;
    },

    async updateStatus(
      id: string,
      status: InvoiceStatus,
      settlement?: SettlementRecord,
    ): Promise<Invoice> {
      const existing = invoicesById.get(id);
      if (!existing) {
        throw new Error(`invoice_not_found`);
      }
      const updated: Invoice = {
        ...existing,
        status,
        settlement: settlement ?? existing.settlement,
        updatedAt: Date.now(),
      };
      invoicesById.set(id, updated);
      return updated;
    },
  },

  payments: {
    async record(p: PaymentRecord): Promise<PaymentRecord> {
      paymentsById.set(p.id, p);
      return p;
    },

    async list(filter?: {
      merchantId?: string;
      chainKey?: ChainKey;
    }): Promise<PaymentRecord[]> {
      const all = Array.from(paymentsById.values());
      const filtered = all.filter((p) => {
        if (filter?.merchantId && p.merchantId !== filter.merchantId)
          return false;
        if (filter?.chainKey && p.chainKey !== filter.chainKey) return false;
        return true;
      });
      filtered.sort((a, b) => b.recordedAt - a.recordedAt);
      return filtered;
    },

    async has(id: string): Promise<boolean> {
      return paymentsById.has(id);
    },
  },
};
