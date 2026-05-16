import { verifyTypedData } from "viem";
import type { Receipt, ReceiptDomain, SignedReceipt } from "./types.js";

export type { Receipt, ReceiptDomain, SignedReceipt };

/**
 * EIP-712 type definitions for a BlockPay receipt. Must stay in lockstep
 * with the merchant-side signer.
 */
export const RECEIPT_TYPES = {
  Receipt: [
    { name: "invoiceId", type: "string" },
    { name: "merchant", type: "address" },
    { name: "payer", type: "address" },
    { name: "amount", type: "string" },
    { name: "currency", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "txHash", type: "bytes32" },
    { name: "paidAt", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

/** Input for `receipts.verify()`. */
export interface VerifyReceiptInput {
  receipt: SignedReceipt;
  /**
   * The merchant address you expect to have signed the receipt. The
   * signer recovered from the signature must equal this — otherwise
   * verification fails.
   */
  expectedMerchant: `0x${string}`;
}

/**
 * Verify EIP-712 signed payment receipts emitted by BlockPay.
 *
 * Receipts are signed off-chain by the merchant's key (or by BlockPay
 * on behalf of the merchant) and can be presented as proof of payment.
 */
export class ReceiptsModule {
  /**
   * Verify an EIP-712 signed receipt against an expected merchant address.
   * Returns `true` if the signature was produced by `expectedMerchant`.
   */
  async verify(input: VerifyReceiptInput): Promise<boolean> {
    const { receipt: signed, expectedMerchant } = input;

    // Cheap consistency check before doing the crypto work.
    if (
      signed.receipt.merchant.toLowerCase() !== expectedMerchant.toLowerCase()
    ) {
      return false;
    }

    // viem's typed-data verifier expects uint256 values as bigint.
    const message = {
      invoiceId: signed.receipt.invoiceId,
      merchant: signed.receipt.merchant,
      payer: signed.receipt.payer,
      amount: signed.receipt.amount,
      currency: signed.receipt.currency,
      chainId: BigInt(signed.receipt.chainId),
      txHash: signed.receipt.txHash,
      paidAt: BigInt(signed.receipt.paidAt),
      nonce: signed.receipt.nonce,
    };

    try {
      return await verifyTypedData({
        address: expectedMerchant,
        domain: signed.domain as ReceiptDomain,
        types: RECEIPT_TYPES,
        primaryType: "Receipt",
        message,
        signature: signed.signature,
      });
    } catch {
      return false;
    }
  }
}
