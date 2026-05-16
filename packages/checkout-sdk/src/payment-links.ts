import type { Transport } from "./transport.js";
import type { ChainKey, Currency, PaymentLink } from "./types.js";

export type { PaymentLink };

/** Input accepted by `paymentLinks.create()`. */
export interface CreatePaymentLinkInput {
  label: string;
  amount: string;
  currency: Currency;
  chainKey: ChainKey;
  description?: string;
}

interface ListResponse<T> {
  data: T[];
}

/**
 * Reusable payment links — a single URL the merchant can share to
 * collect the same amount from many payers.
 */
export class PaymentLinksModule {
  constructor(private readonly transport: Transport) {}

  /** Create a new payment link. */
  async create(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    return this.transport.request<PaymentLink>("/api/v1/payment-links", {
      method: "POST",
      body: input,
    });
  }

  /** Fetch a single payment link by id. */
  async get(id: string): Promise<PaymentLink> {
    return this.transport.request<PaymentLink>(
      `/api/v1/payment-links/${encodeURIComponent(id)}`,
    );
  }

  /** Return every payment link owned by the authenticated merchant. */
  async list(): Promise<PaymentLink[]> {
    const res = await this.transport.request<
      ListResponse<PaymentLink> | PaymentLink[]
    >("/api/v1/payment-links");
    if (Array.isArray(res)) return res;
    return res.data;
  }

  /**
   * Archive a payment link. Archived links return HTTP 410 when visited.
   * Returns `void`; throws on failure.
   */
  async archive(id: string): Promise<void> {
    await this.transport.request<void>(
      `/api/v1/payment-links/${encodeURIComponent(id)}/archive`,
      { method: "POST" },
    );
  }
}
