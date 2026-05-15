/**
 * BlockPay on-chain indexer.
 *
 * Polls the deployed BlockPayRouter on each supported chain for `Settled`
 * events and writes matching payments to Postgres via Prisma. Designed to
 * run from a manual trigger (route handler) or a cron in production. The
 * default scan window is 5,000 blocks back from the latest tip; that is
 * tuned for testnets and should be reduced for high-throughput chains.
 */

import { parseEventLogs, type Log } from "viem";
import { CHAINS, type ChainKey, type ChainConfig } from "./contracts";
import { ROUTER_ABI, publicClientFor } from "./web3";
import { prisma } from "./prisma";

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

/**
 * Resolve (or create) a Merchant row keyed on a settlement address.
 *
 * NOTE(demo-fallback): Mirrors the demo-fallback in `lib/storage.ts`. If an
 * on-chain Settled event references a merchant address we've never seen
 * before (e.g. local test deployments using a throw-away wallet) we still
 * record the payment under a placeholder Merchant so the indexer keeps
 * making progress. Remove once signup is mandatory.
 */
async function resolveMerchantIdByAddress(
  settlementAddress: string,
  chainKey: ChainKey,
): Promise<string> {
  const addrLc = settlementAddress.toLowerCase();
  const existing = await prisma.merchant.findFirst({
    where: { settlementAddress: addrLc },
  });
  if (existing) return existing.id;

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

    // Fetch the block to anchor the payment's timestamp on-chain rather
    // than at recording time. If the call fails we fall back to `now`.
    let blockTimestamp = new Date();
    try {
      const block = await client.getBlock({ blockNumber });
      blockTimestamp = new Date(Number(block.timestamp) * 1000);
    } catch {
      // keep fallback
    }

    const invoice = await prisma.invoice.findUnique({
      where: { onChainInvoiceId: args.invoiceId.toLowerCase() },
    });

    // Resolve the merchant id: prefer the invoice's merchant, fall back
    // to a lookup by settlement address (creating a demo Merchant if
    // needed). The merchant id isn't stored on Payment directly but the
    // lookup ensures the address exists in our system before we record.
    if (!invoice) {
      await resolveMerchantIdByAddress(args.merchant, chainKey);
    }

    const result = await prisma.payment.upsert({
      where: {
        chainKey_txHash_logIndex: {
          chainKey,
          txHash: txHash.toLowerCase(),
          logIndex,
        },
      },
      create: {
        invoiceId: invoice?.id ?? null,
        onChainInvoiceId: args.invoiceId.toLowerCase(),
        chainKey,
        txHash: txHash.toLowerCase(),
        logIndex,
        payer: args.payer.toLowerCase(),
        merchantAddress: args.merchant.toLowerCase(),
        tokenAddress: args.token.toLowerCase(),
        amount: args.amount.toString(),
        feeAmount: args.feeAmount.toString(),
        memoCid: args.memoCid.toLowerCase(),
        blockNumber: BigInt(blockNumber),
        blockTimestamp,
      },
      update: {},
    });

    // Crude "was this newly inserted" check: a freshly-created row has
    // recordedAt within the last few seconds. Good enough for the
    // counter; the actual side effect is idempotent regardless.
    const isNew = Date.now() - result.recordedAt.getTime() < 5000;
    if (isNew) {
      recorded += 1;
    } else {
      skipped += 1;
    }

    if (invoice && invoice.status !== "paid") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "paid",
          paidAt: blockTimestamp,
        },
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
