/**
 * BlockPay storage layer.
 *
 * Backed by Prisma against the Railway Postgres database. The public surface
 * (the `storage` named export and the `Invoice` / `PaymentRecord` / etc. types
 * below) is preserved for the existing API routes and the indexer — those
 * callers still see millisecond timestamps, `0x${string}` addresses, and a
 * synthesized `settlement` blob on each invoice, even though the underlying
 * rows live in `Invoice`, `Payment`, and `Merchant` tables.
 *
 * Translation rules:
 *   - DateTime <-> ms-since-epoch (number)
 *   - Payment.blockNumber is BigInt in Postgres; we surface it as a JS number
 *     here. Routes that JSON.stringify Payment rows themselves (i.e. the
 *     indexer status pipeline) must convert via `.toString()` first.
 *   - `lineItems` is stored as `Json` in Postgres and re-typed as `LineItem[]`.
 */

import type {
  Invoice as PrismaInvoice,
  Payment as PrismaPayment,
} from "@prisma/client";
import { prisma } from "./prisma";
import type { ChainKey } from "./contracts";

// ---- Domain types (preserved for backward compatibility) ----

export type InvoiceStatus = "draft" | "open" | "paid" | "expired" | "void";

export type LineItem = {
  label: string;
  amount: string;
};

export type InvoiceInput = {
  /**
   * Application-level merchant id. The `create` method below will resolve
   * this to a real `Merchant.id` row. If no Merchant matches the caller's
   * `merchantAddress`, a demo Merchant + User is created inline. See the
   * comment on `create` for the rationale.
   */
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

// ---- Helpers ----

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

function as0x(v: string): `0x${string}` {
  return (v.startsWith("0x") ? v : `0x${v}`) as `0x${string}`;
}

type PrismaInvoiceWithPayments = PrismaInvoice & { payments?: PrismaPayment[] };

function rowToInvoice(row: PrismaInvoiceWithPayments): Invoice {
  // Synthesize the `settlement` blob from the most recent recorded Payment
  // so callers that used to read `invoice.settlement` keep working.
  const latestPayment = row.payments?.[0];
  const settlement: SettlementRecord | undefined = latestPayment
    ? {
        txHash: as0x(latestPayment.txHash),
        blockNumber: Number(latestPayment.blockNumber),
        logIndex: latestPayment.logIndex,
        payer: as0x(latestPayment.payer),
        amount: latestPayment.amount,
        feeAmount: latestPayment.feeAmount,
        settledAt: latestPayment.blockTimestamp.getTime(),
      }
    : undefined;

  return {
    id: row.id,
    onChainInvoiceId: as0x(row.onChainInvoiceId),
    merchantId: row.merchantId,
    merchantAddress: as0x(row.merchantAddress),
    amount: row.amount,
    currency: row.currency as "USDC" | "EURC",
    chainKey: row.chainKey as ChainKey,
    lineItems: (row.lineItems as unknown as LineItem[]) ?? [],
    memoCid: row.memoCid ? as0x(row.memoCid) : undefined,
    expiresAt: row.expiresAt ? row.expiresAt.getTime() : undefined,
    status: row.status as InvoiceStatus,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    settlement,
  };
}

function rowToPayment(row: PrismaPayment): PaymentRecord {
  return {
    id: `${row.chainKey}:${row.txHash.toLowerCase()}:${row.logIndex}`,
    chainKey: row.chainKey as ChainKey,
    onChainInvoiceId: as0x(row.onChainInvoiceId ?? "0x"),
    invoiceId: row.invoiceId ?? undefined,
    merchantId: undefined,
    merchantAddress: as0x(row.merchantAddress),
    payer: as0x(row.payer),
    token: as0x(row.tokenAddress),
    amount: row.amount,
    feeAmount: row.feeAmount,
    memoCid: as0x(row.memoCid ?? "0x"),
    txHash: as0x(row.txHash),
    blockNumber: Number(row.blockNumber),
    logIndex: row.logIndex,
    recordedAt: row.recordedAt.getTime(),
  };
}

/**
 * Resolve (or create) a Merchant row keyed on a settlement address.
 *
 * NOTE(demo-fallback): The unauth E2E tests and the public landing-page
 * "Create demo invoice" button POST to /api/invoices without signing in,
 * so the caller does not yet have a Merchant row. We materialize a "demo"
 * Merchant + User on the fly to keep those code paths working. Remove this
 * fallback once signup is mandatory and the API requires an authenticated
 * session.
 */
async function resolveMerchantId(
  settlementAddress: string,
  chainKey: string,
): Promise<string> {
  const addrLc = settlementAddress.toLowerCase();
  const existing = await prisma.merchant.findFirst({
    where: { settlementAddress: addrLc },
  });
  if (existing) return existing.id;

  // Demo fallback: create a placeholder User + Merchant tied to this address.
  const demoUser = await prisma.user.create({
    data: {
      walletAddress: `${addrLc}-demo-${Date.now()}`,
    },
  });
  const created = await prisma.merchant.create({
    data: {
      userId: demoUser.id,
      businessName: "Demo Merchant",
      settlementAddress: addrLc,
      settlementChainKey: chainKey,
      settlementCurrency: "USDC",
    },
  });
  return created.id;
}

// ---- Implementation ----

export const storage: Storage = {
  invoices: {
    async create(input: InvoiceInput): Promise<Invoice> {
      const merchantId = await resolveMerchantId(
        input.merchantAddress,
        input.chainKey,
      );

      const id = randomId("inv");
      const onChainInvoiceId = randomOnChainInvoiceId();

      const row = await prisma.invoice.create({
        data: {
          id,
          merchantId,
          onChainInvoiceId: onChainInvoiceId.toLowerCase(),
          merchantAddress: input.merchantAddress.toLowerCase(),
          amount: input.amount,
          currency: input.currency,
          chainKey: input.chainKey,
          lineItems: input.lineItems as unknown as object,
          memoCid: input.memoCid ? input.memoCid.toLowerCase() : null,
          status: "open",
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      });

      return rowToInvoice(row);
    },

    async get(id: string): Promise<Invoice | null> {
      const row = await prisma.invoice.findUnique({
        where: { id },
        include: {
          payments: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });
      return row ? rowToInvoice(row) : null;
    },

    async getByOnChainId(
      invoiceIdHex: `0x${string}`,
    ): Promise<Invoice | null> {
      const row = await prisma.invoice.findUnique({
        where: { onChainInvoiceId: invoiceIdHex.toLowerCase() },
        include: {
          payments: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });
      return row ? rowToInvoice(row) : null;
    },

    async list(filter?: {
      merchantId?: string;
      status?: InvoiceStatus;
    }): Promise<Invoice[]> {
      const rows = await prisma.invoice.findMany({
        where: {
          ...(filter?.merchantId ? { merchantId: filter.merchantId } : {}),
          ...(filter?.status ? { status: filter.status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          payments: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });
      return rows.map(rowToInvoice);
    },

    async updateStatus(
      id: string,
      status: InvoiceStatus,
      settlement?: SettlementRecord,
    ): Promise<Invoice> {
      const row = await prisma.invoice.update({
        where: { id },
        data: {
          status,
          paidAt:
            status === "paid"
              ? settlement
                ? new Date(settlement.settledAt)
                : new Date()
              : undefined,
        },
        include: {
          payments: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });
      return rowToInvoice(row);
    },
  },

  payments: {
    async record(p: PaymentRecord): Promise<PaymentRecord> {
      const row = await prisma.payment.upsert({
        where: {
          chainKey_txHash_logIndex: {
            chainKey: p.chainKey,
            txHash: p.txHash.toLowerCase(),
            logIndex: p.logIndex,
          },
        },
        create: {
          invoiceId: p.invoiceId ?? null,
          onChainInvoiceId: p.onChainInvoiceId.toLowerCase(),
          chainKey: p.chainKey,
          txHash: p.txHash.toLowerCase(),
          logIndex: p.logIndex,
          payer: p.payer.toLowerCase(),
          merchantAddress: p.merchantAddress.toLowerCase(),
          tokenAddress: p.token.toLowerCase(),
          amount: p.amount,
          feeAmount: p.feeAmount,
          memoCid: p.memoCid.toLowerCase(),
          blockNumber: BigInt(p.blockNumber),
          blockTimestamp: new Date(p.recordedAt),
        },
        update: {},
      });
      return rowToPayment(row);
    },

    async list(filter?: {
      merchantId?: string;
      chainKey?: ChainKey;
    }): Promise<PaymentRecord[]> {
      // `merchantId` filter: resolve to the merchant's settlementAddress so
      // we can match Payment.merchantAddress (Payment doesn't FK to Merchant
      // directly).
      let merchantAddressFilter: string | undefined;
      if (filter?.merchantId) {
        const merchant = await prisma.merchant.findUnique({
          where: { id: filter.merchantId },
        });
        if (!merchant) return [];
        merchantAddressFilter = merchant.settlementAddress.toLowerCase();
      }

      const rows = await prisma.payment.findMany({
        where: {
          ...(merchantAddressFilter
            ? { merchantAddress: merchantAddressFilter }
            : {}),
          ...(filter?.chainKey ? { chainKey: filter.chainKey } : {}),
        },
        orderBy: { recordedAt: "desc" },
      });
      return rows.map(rowToPayment);
    },

    async has(id: string): Promise<boolean> {
      // id format: `${chainKey}:${txHash}:${logIndex}`
      const parts = id.split(":");
      if (parts.length !== 3) return false;
      const [chainKey, txHash, logIndexStr] = parts;
      const logIndex = Number(logIndexStr);
      if (!Number.isFinite(logIndex)) return false;
      const row = await prisma.payment.findUnique({
        where: {
          chainKey_txHash_logIndex: {
            chainKey,
            txHash: txHash.toLowerCase(),
            logIndex,
          },
        },
        select: { id: true },
      });
      return row !== null;
    },
  },
};
