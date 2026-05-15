/**
 * Circle Paymaster integration — on-chain only.
 *
 * Circle Paymaster is a deployed smart contract on each supported chain
 * (addresses in `lib/contracts.ts` as `circlePaymasterV08`). It accepts USDC
 * as payment for gas via the ERC-4337 paymaster interface.
 *
 * Flow per payment:
 *  1. Customer signs an EIP-2612 permit granting the Paymaster contract a
 *     small USDC allowance for gas.
 *  2. We build a UserOperation (v0.8) calling BlockPayRouter.pay(),
 *     with paymaster = circlePaymasterV08 and paymasterData = the encoded
 *     permit signature.
 *  3. We submit the UserOp to a third-party bundler (Pimlico free tier
 *     is the default).
 *  4. Bundler executes, paymaster pulls USDC from the customer's account
 *     to cover gas, BlockPayRouter settles the payment.
 *
 * Prerequisite: bundler URL for the chain. If absent,
 * `paymasterAvailable()` returns false and the checkout falls back to the
 * regular EOA approve+pay flow.
 */

import { createPublicClient, http, type PublicClient } from "viem";
import {
  createBundlerClient,
  type BundlerClient,
} from "viem/account-abstraction";
import { CHAINS, type ChainConfig, type ChainKey } from "./contracts";

export type PaymasterContext = {
  chain: ChainConfig;
  paymasterAddress: `0x${string}`;
  entryPoint: `0x${string}`;
  bundlerUrl: string;
};

/**
 * Returns the per-chain gasless context if the bundler URL is set in env
 * AND a Circle Paymaster contract is deployed on the chain. Else null.
 */
export function paymasterContextFor(chainKey: ChainKey): PaymasterContext | null {
  const chain = CHAINS[chainKey];
  if (!chain.circlePaymasterV08 || !chain.entryPointV08) return null;

  const bundlerUrl = bundlerUrlFor(chainKey);
  if (!bundlerUrl) return null;

  return {
    chain,
    paymasterAddress: chain.circlePaymasterV08,
    entryPoint: chain.entryPointV08,
    bundlerUrl,
  };
}

export function paymasterAvailable(chainKey: ChainKey): boolean {
  return paymasterContextFor(chainKey) !== null;
}

function bundlerUrlFor(chainKey: ChainKey): string | undefined {
  switch (chainKey) {
    case "base-sepolia":
      return process.env.NEXT_PUBLIC_BUNDLER_URL_BASE_SEPOLIA;
    case "arc-testnet":
      return process.env.NEXT_PUBLIC_BUNDLER_URL_ARC_TESTNET;
    default:
      return undefined;
  }
}

function rpcUrlsFor(key: ChainKey): string[] {
  switch (key) {
    case "base-sepolia":
      return ["https://sepolia.base.org"];
    case "arc-testnet":
      return ["https://rpc.testnet.arc.network"];
    case "base":
      return ["https://mainnet.base.org"];
    case "arc":
      return ["https://rpc.arc.network"];
    default:
      return [];
  }
}

/**
 * Builds the public + bundler clients used by the gasless UserOp flow.
 * Returns null if config is missing for the chain.
 */
export function buildPaymasterClients(chainKey: ChainKey): {
  publicClient: PublicClient;
  bundlerClient: BundlerClient;
  ctx: PaymasterContext;
} | null {
  const ctx = paymasterContextFor(chainKey);
  if (!ctx) return null;

  const publicClient = createPublicClient({
    transport: http(rpcUrlsFor(chainKey)[0]),
  });
  const bundlerClient = createBundlerClient({
    transport: http(ctx.bundlerUrl),
  });

  return { publicClient, bundlerClient, ctx };
}

/**
 * EIP-2612 permit typed-data builder for native USDC. Used to grant the
 * Circle Paymaster contract a small USDC allowance for gas — without ever
 * needing native gas tokens from the customer.
 *
 * Pass the returned object to `walletClient.signTypedData(...)`. The 65-byte
 * signature becomes part of the paymasterData field of the UserOp.
 */
export function buildUsdcPermit(args: {
  owner: `0x${string}`;
  spender: `0x${string}`; // Circle Paymaster contract
  value: bigint;
  nonce: bigint;
  deadline: bigint;
  chainId: number;
  usdcAddress: `0x${string}`;
  usdcName?: string;
}) {
  const name = args.usdcName ?? "USD Coin";
  return {
    domain: {
      name,
      version: "2",
      chainId: args.chainId,
      verifyingContract: args.usdcAddress,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit" as const,
    message: {
      owner: args.owner,
      spender: args.spender,
      value: args.value,
      nonce: args.nonce,
      deadline: args.deadline,
    },
  };
}
