import type { Transport } from "./transport.js";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
} from "./types.js";

export type { CreateInvoiceInput, Invoice, InvoiceStatus };

/** Filter accepted by `invoices.list()`. */
export interface ListInvoicesFilter {
  merchantId?: string;
  status?: InvoiceStatus;
  /** Max rows returned by the server. Server caps at 100. */
  limit?: number;
  /** Cursor returned by a previous page. */
  cursor?: string;
}

interface ListResponse<T> {
  data: T[];
  nextCursor?: string;
}

/**
 * Invoice operations: create one-shot invoices, look them up, and list.
 *
 * Construct via the top-level `BlockPay` client — never instantiate
 * directly unless wiring a custom transport for tests.
 */
export class InvoicesModule {
  constructor(private readonly transport: Transport) {}

  /** Create a new invoice. Returns the materialised record. */
  async create(input: CreateInvoiceInput): Promise<Invoice> {
    return this.transport.request<Invoice>("/api/v1/invoices", {
      method: "POST",
      body: input,
    });
  }

  /** Fetch an invoice by id. Throws `BlockPayError` if not found. */
  async get(id: string): Promise<Invoice> {
    if (!id) {
      throw new Error("invoice id is required");
    }
    return this.transport.request<Invoice>(
      `/api/v1/invoices/${encodeURIComponent(id)}`,
    );
  }

  /**
   * List invoices, optionally filtered. Pagination is server-driven;
   * supply `cursor` from the previous response to fetch the next page.
   */
  async list(filter: ListInvoicesFilter = {}): Promise<Invoice[]> {
    const res = await this.transport.request<ListResponse<Invoice> | Invoice[]>(
      "/api/v1/invoices",
      {
        query: {
          merchantId: filter.merchantId,
          status: filter.status,
          limit: filter.limit,
          cursor: filter.cursor,
        },
      },
    );
    // Server may return either a bare array or a `{ data, nextCursor }`
    // envelope depending on whether pagination is enabled.
    if (Array.isArray(res)) return res;
    return res.data;
  }

  /** Cancel a pending invoice. The server rejects this on `paid` invoices. */
  async cancel(id: string): Promise<Invoice> {
    return this.transport.request<Invoice>(
      `/api/v1/invoices/${encodeURIComponent(id)}/cancel`,
      { method: "POST" },
    );
  }
}
