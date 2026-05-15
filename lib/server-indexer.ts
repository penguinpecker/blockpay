/**
 * BlockPay on-chain indexer.
 *
 * Polls the deployed BlockPayRouter on each supported chain for `Settled`
 * events and writes matching payments to the storage layer. Designed to
 * run from a manual trigger (route handler) or a cron in production. The
 * default scan window is 5,000 blocks back from the latest tip; that is
 * tuned for testnets and should be reduced for high-throughput chains.
 */

import { parseEventLogs, type Log } from "viem";
import { CHAINS, type ChainKey, type ChainConfig } from "./contracts";
import { ROUTER_ABI, publicClientFor } from "./web3";
import { storage, type PaymentRecord } from "./storage";

const DEFAULT_SCAN_WINDOW = BigInt(5000);
const ZERO = BigInt(0);
const INDEXABLE_CHAINS: ChainKey[] = ["base-sepolia", "arc-testnet"];

export type IndexResult = {
  chainKey: ChainKey;
  fromBlock: string;
  toBlock: string;
  scanned: number;
  recorded: number;
  skipped: number;
  error?: string;
};

type SettledArgs = {
  invoiceId: `0x${string}`;
  payer: `0x${string}`;
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  feeAmount: bigint;
  memoCid: `0x${string}`;
};

function paymentIdFor(
  chainKey: ChainKey,
  txHash: `0x${string}`,
  logIndex: number,
): string {
  return `${chainKey}:${txHash.toLowerCase()}:${logIndex}`;
}

export async function indexChain(
  chainKey: ChainKey,
  opts: { windowBlocks?: bigint } = {},
): Promise<IndexResult> {
  const chain: ChainConfig | undefined = CHAINS[chainKey];
  if (!chain || !chain.router) {
    return {
      chainKey,
      fromBlock: "0",
      toBlock: "0",
      scanned: 0,
      recorded: 0,
      skipped: 0,
      error: "router_not_configured",
    };
  }

  const client = publicClientFor(chain);
  const window = opts.windowBlocks ?? DEFAULT_SCAN_WINDOW;

  let toBlock: bigint;
  try {
    toBlock = await client.getBlockNumber();
  } catch {
    return {
      chainKey,
      fromBlock: "0",
      toBlock: "0",
      scanned: 0,
      recorded: 0,
      skipped: 0,
      error: "rpc_unavailable",
    };
  }

  const fromBlock = toBlock > window ? toBlock - window : ZERO;

  let rawLogs: Log[];
  try {
    rawLogs = (await client.getLogs({
      address: chain.router,
      fromBlock,
      toBlock,
    })) as Log[];
  } catch {
    return {
      chainKey,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      scanned: 0,
      recorded: 0,
      skipped: 0,
      error: "log_fetch_failed",
    };
  }

  const events = parseEventLogs({
    abi: ROUTER_ABI,
    eventName: "Settled",
    logs: rawLogs,
  });

  let recorded = 0;
  let skipped = 0;

  for (const ev of events) {
    const args = ev.args as unknown as SettledArgs;
    const txHash = ev.transactionHash as `0x${string}` | null;
    const logIndex = ev.logIndex;
    const blockNumber = ev.blockNumber;
    if (!txHash || logIndex === null || blockNumber === null) {
      skipped += 1;
      continue;
    }

    const id = paymentIdFor(chainKey, txHash, logIndex);
    if (await storage.payments.has(id)) {
      skipped += 1;
      continue;
    }

    const invoice = await storage.invoices.getByOnChainId(args.invoiceId);

    const record: PaymentRecord = {
      id,
      chainKey,
      onChainInvoiceId: args.invoiceId,
      invoiceId: invoice?.id,
      merchantId: invoice?.merchantId,
      merchantAddress: args.merchant,
      payer: args.payer,
      token: args.token,
      amount: args.amount.toString(),
      feeAmount: args.feeAmount.toString(),
      memoCid: args.memoCid,
      txHash,
      blockNumber: Number(blockNumber),
      logIndex,
      recordedAt: Date.now(),
    };

    await storage.payments.record(record);
    recorded += 1;

    if (invoice && invoice.status !== "paid") {
      await storage.invoices.updateStatus(invoice.id, "paid", {
        txHash,
        blockNumber: Number(blockNumber),
        logIndex,
        payer: args.payer,
        amount: args.amount.toString(),
        feeAmount: args.feeAmount.toString(),
        settledAt: Date.now(),
      });
    }
  }

  return {
    chainKey,
    fromBlock: fromBlock.toString(),
    toBlock: toBlock.toString(),
    scanned: events.length,
    recorded,
    skipped,
  };
}

export async function indexAll(opts: {
  windowBlocks?: bigint;
} = {}): Promise<IndexResult[]> {
  const results = await Promise.all(
    INDEXABLE_CHAINS.map((c) => indexChain(c, opts)),
  );
  return results;
}

export function indexableChains(): ChainKey[] {
  return [...INDEXABLE_CHAINS];
}
