/**
 * Gasless ERC-4337 checkout flow for BlockPay using Circle Paymaster v0.8.
 *
 * The customer's EOA owns a Kernel ECDSA smart account (SCA). The SCA holds
 * USDC and pays the merchant via `BlockPayRouter.pay()` — the Circle Paymaster
 * pulls a small USDC allowance for gas via an EIP-2612 permit signed by the
 * SCA (ERC-1271). No native gas token ever leaves the customer's wallet.
 *
 * Note on permissionless v0.3.5 typing: this version exposes Kernel accounts
 * with `EntryPointVersion = "0.6" | "0.7"` only. Circle Paymaster v0.8 runs
 * on EntryPoint v0.8 at 0x4337...8108 — the actual address is passed through
 * to viem under the v0.7 type tag. If the bundler reports a version mismatch
 * at runtime, this is the place to revisit.
 */

import {
  type Address,
  type Hex,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  custom,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  parseAbi,
} from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { arcTestnet, baseSepolia } from "viem/chains";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";

import {
  ROUTER_ABI,
  ERC20_ABI,
  randomInvoiceId,
} from "./web3";
import { paymasterContextFor, buildUsdcPermit } from "./paymaster";
import { CHAINS } from "./contracts";

export type GaslessStatus =
  | { kind: "preparing-sca" }
  | { kind: "minting-test-usdc" }
  | { kind: "signing-permit" }
  | { kind: "submitting" }
  | { kind: "waiting-receipt"; userOpHash: `0x${string}` };

export type PayGaslessParams = {
  chainKey: "base-sepolia" | "arc-testnet";
  payerEoa: `0x${string}`;
  amountUsdc: bigint;
  merchantAddress: `0x${string}`;
  invoiceId?: `0x${string}`;
  memoCid?: `0x${string}`;
  onStatus?: (status: GaslessStatus) => void;
};

export type PayGaslessResult = {
  userOpHash: `0x${string}`;
  txHash: `0x${string}`;
  scaAddress: `0x${string}`;
};

/** 10 USDC ceiling Circle may pull for gas (it only takes what's used). */
const PERMIT_GAS_CEILING: bigint = BigInt(10_000_000);
/** Extra USDC minted into the SCA on testnet to cover gas pulls. */
const TEST_USDC_GAS_BUFFER: bigint = BigInt(10_000_000);

const USDC_PERMIT_ABI = parseAbi([
  "function nonces(address owner) view returns (uint256)",
]);

function rpcUrlFor(key: "base-sepolia" | "arc-testnet"): string {
  return key === "base-sepolia"
    ? "https://sepolia.base.org"
    : "https://rpc.testnet.arc.network";
}

function viemChainFor(key: "base-sepolia" | "arc-testnet") {
  return key === "base-sepolia" ? baseSepolia : arcTestnet;
}

/** Redact ?apikey=... so we never log bundler API keys. */
function redactBundlerUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("apikey")) u.searchParams.set("apikey", "[redacted]");
    return u.toString();
  } catch {
    return "[opaque bundler url]";
  }
}

function getInjectedProvider(): { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found.");
  }
  return window.ethereum as unknown as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

/**
 * Pay via the gasless Circle Paymaster + Kernel SCA flow.
 */
export async function payGasless(params: PayGaslessParams): Promise<PayGaslessResult> {
  const { chainKey, payerEoa, amountUsdc, merchantAddress, onStatus } = params;

  // 1. Paymaster + bundler config
  const ctx = paymasterContextFor(chainKey);
  if (!ctx) {
    throw new Error(
      `Gasless flow not available on ${chainKey}. Missing bundler URL or Circle Paymaster address.`
    );
  }
  const chainCfg = CHAINS[chainKey];
  const tokenAddress: Address | null =
    chainCfg.testUsdc ?? chainCfg.usdc ?? null;
  const routerAddress = chainCfg.router;
  if (!tokenAddress || !routerAddress) {
    throw new Error(`USDC / Router not configured for ${chainKey}.`);
  }

  onStatus?.({ kind: "preparing-sca" });

  // 2. viem clients — wallet client over injected provider, public client over RPC.
  const provider = getInjectedProvider();
  const viemChain = viemChainFor(chainKey);
  const wallet: WalletClient = createWalletClient({
    account: payerEoa,
    chain: viemChain,
    transport: custom(provider as Parameters<typeof custom>[0]),
  });
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(rpcUrlFor(chainKey)),
  });

  // 3. Kernel ECDSA SCA owned by the EOA.
  //    permissionless@0.3.5 caps the type at v0.7 — see file-level note above.
  const kernelAccount = await toEcdsaKernelSmartAccount({
    client: publicClient,
    owners: [provider as unknown as Parameters<typeof toEcdsaKernelSmartAccount>[0]["owners"][0]],
    entryPoint: {
      address: ctx.entryPoint,
      version: "0.7",
    },
    version: "0.3.1",
  });
  const scaAddress = kernelAccount.address as `0x${string}`;

  // 4. Testnet helper: fund the SCA with TestUSDC so it can pay merchant + gas.
  if (chainCfg.testUsdc && chainCfg.testUsdc === tokenAddress) {
    const required = amountUsdc + TEST_USDC_GAS_BUFFER;
    const scaBalance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [scaAddress],
    })) as bigint;

    if (scaBalance < required) {
      onStatus?.({ kind: "minting-test-usdc" });
      const mintHash = await wallet.writeContract({
        account: payerEoa,
        chain: viemChain,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [scaAddress, required],
      });
      await publicClient.waitForTransactionReceipt({ hash: mintHash });
    }
  }

  // 5. EIP-2612 permit: SCA (owner) → Circle Paymaster (spender) for gas.
  onStatus?.({ kind: "signing-permit" });
  const permitNonce = (await publicClient.readContract({
    address: tokenAddress,
    abi: USDC_PERMIT_ABI,
    functionName: "nonces",
    args: [scaAddress],
  })) as bigint;

  const permitDeadline: bigint = BigInt(Math.floor(Date.now() / 1000) + 60 * 60);

  const permitTypedData = buildUsdcPermit({
    owner: scaAddress,
    spender: ctx.paymasterAddress,
    value: PERMIT_GAS_CEILING,
    nonce: permitNonce,
    deadline: permitDeadline,
    chainId: chainCfg.chainId,
    usdcAddress: tokenAddress,
  });

  // The SCA is the owner, but it's a smart contract — the EOA signs on its
  // behalf via the Kernel account's signTypedData. Circle Paymaster v0.8
  // validates the permit through ERC-1271 (isValidSignature on the SCA) when
  // the owner is a contract, so we pass the FULL kernel-wrapped signature as
  // the `bytes` field, NOT a packed r||s||v ECDSA tuple.
  const permitSignature = (await kernelAccount.signTypedData(permitTypedData)) as Hex;

  // Circle Paymaster v0.8 expected layout (per their docs/contract):
  //   abi.encode(owner, value, deadline, signature)
  // If validation fails, this is the most likely culprit — we surface the
  // bundler error (apikey redacted) and re-throw with a clear message.
  const paymasterData = encodeAbiParameters(
    [
      { type: "address", name: "owner" },
      { type: "uint256", name: "value" },
      { type: "uint256", name: "deadline" },
      { type: "bytes", name: "signature" },
    ],
    [scaAddress, PERMIT_GAS_CEILING, permitDeadline, permitSignature]
  );

  // 6. Build BlockPayRouter.pay(...) calldata for the SCA to execute().
  const invoiceId = params.invoiceId ?? randomInvoiceId();
  const memoCid = params.memoCid ?? invoiceId;

  const routerCalldata = encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: "pay",
    args: [
      {
        invoiceId,
        token: tokenAddress,
        amount: amountUsdc,
        merchant: merchantAddress,
        memoCid,
        splits: [],
      },
    ],
  });

  // Kernel SCA executes(target, value, data) — use SCA's encodeCalls path via
  // bundlerClient.sendUserOperation(calls).
  const bundlerClient = createBundlerClient({
    chain: viemChain,
    transport: http(ctx.bundlerUrl),
    client: publicClient,
  });

  onStatus?.({ kind: "submitting" });
  let userOpHash: `0x${string}`;
  try {
    userOpHash = (await bundlerClient.sendUserOperation({
      account: kernelAccount,
      calls: [
        {
          to: routerAddress,
          value: BigInt(0),
          data: routerCalldata,
        },
      ],
      paymaster: ctx.paymasterAddress,
      paymasterData,
      paymasterVerificationGasLimit: BigInt(100_000),
      paymasterPostOpGasLimit: BigInt(50_000),
    } as Parameters<typeof bundlerClient.sendUserOperation>[0])) as `0x${string}`;
  } catch (err: unknown) {
    const e = err as { message?: string; details?: string; shortMessage?: string };
    // eslint-disable-next-line no-console
    console.error("[blockpay-gasless] bundler send failed", {
      bundlerUrl: redactBundlerUrl(ctx.bundlerUrl),
      message: e?.message,
      details: e?.details,
      shortMessage: e?.shortMessage,
    });
    throw new Error(
      "Circle Paymaster validation failed — likely paymasterData encoding mismatch."
    );
  }

  // 7. Wait for receipt
  onStatus?.({ kind: "waiting-receipt", userOpHash });
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  return {
    userOpHash,
    txHash: receipt.receipt.transactionHash as `0x${string}`,
    scaAddress,
  };
}

// Re-export for any caller that wants to gate UI on availability without
// re-importing from `./paymaster`.
export { paymasterAvailable } from "./paymaster";
