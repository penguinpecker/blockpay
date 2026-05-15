/**
 * Browser web3 wiring for BlockPay. Viem-based, no wagmi/RainbowKit so we
 * keep bundle size tight. Talks to the deployed BlockPayRouter on the
 * supported demo chains (Base Sepolia + Arc testnet).
 */

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseAbi,
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient,
} from "viem";
import { CHAINS, type ChainConfig, type ChainKey } from "./contracts";

// ---- ABIs ----

export const ROUTER_ABI = parseAbi([
  "struct Split { address recipient; uint16 bps; }",
  "struct PaymentParams { bytes32 invoiceId; address token; uint256 amount; address merchant; bytes32 memoCid; Split[] splits; }",
  "function pay(PaymentParams params)",
  "function feeBps() view returns (uint16)",
  "function feeRecipient() view returns (address)",
  "function settled(bytes32) view returns (bool)",
  "function paused() view returns (bool)",
  "event Settled(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, address token, uint256 amount, uint256 feeAmount, bytes32 memoCid)",
]);

export const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 amount)",
]);

// ---- Pill chain id → ChainConfig mapping ----

export type PillChainId = "arc" | "base" | "ethereum" | "solana";

export function configForPill(pill: PillChainId): {
  chain: ChainConfig | null;
  status: "live-testnet" | "live-mainnet" | "coming-soon" | "non-evm";
} {
  switch (pill) {
    case "arc":
      return { chain: CHAINS["arc-testnet"], status: "live-testnet" };
    case "base":
      return { chain: CHAINS["base-sepolia"], status: "live-testnet" };
    case "ethereum":
      return { chain: null, status: "coming-soon" };
    case "solana":
      return { chain: null, status: "non-evm" };
  }
}

// ---- Wallet helpers (browser only) ----

type Ethereum = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function getEthereum(): Ethereum {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or a compatible wallet.");
  }
  return window.ethereum;
}

export async function requestAccounts(): Promise<Address> {
  const accounts = (await getEthereum().request({
    method: "eth_requestAccounts",
  })) as Address[];
  if (!accounts || accounts.length === 0) throw new Error("No account returned by wallet.");
  return accounts[0];
}

export async function getChainId(): Promise<number> {
  const hex = (await getEthereum().request({ method: "eth_chainId" })) as string;
  return parseInt(hex, 16);
}

/**
 * Switch (or add if missing) to a target chain. Returns when the wallet is
 * on the target chain.
 */
export async function ensureChain(target: ChainConfig): Promise<void> {
  const eth = getEthereum();
  const hex = `0x${target.chainId.toString(16)}`;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hex }],
    });
  } catch (err: unknown) {
    // 4902 = unrecognized chain. Try to add it.
    const e = err as { code?: number };
    if (e?.code === 4902 || (e as { data?: { originalError?: { code?: number } } })?.data?.originalError?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hex,
            chainName: target.name,
            nativeCurrency:
              target.key === "arc-testnet"
                ? { name: "USD Coin", symbol: "USDC", decimals: 18 }
                : { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: rpcUrlsFor(target.key),
            blockExplorerUrls: [target.explorerBase],
          },
        ],
      });
    } else {
      throw err;
    }
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
    case "ethereum":
      return ["https://ethereum-rpc.publicnode.com"];
    case "optimism":
      return ["https://mainnet.optimism.io"];
    case "arbitrum":
      return ["https://arb1.arbitrum.io/rpc"];
    case "polygon":
      return ["https://polygon-rpc.com"];
  }
}

// ---- Viem clients ----

export function publicClientFor(chain: ChainConfig): PublicClient {
  return createPublicClient({
    transport: http(rpcUrlsFor(chain.key)[0]),
  });
}

export function walletClient(): WalletClient {
  return createWalletClient({
    transport: custom(getEthereum() as Parameters<typeof custom>[0]),
  });
}

// ---- Receipt / CID helpers ----

/** Random 32-byte invoice id, used for demo payments. */
export function randomInvoiceId(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}` as Hex;
}

/** Deterministic mock receipt CID for demo (placeholder for real IPFS pin). */
export function mockReceiptCid(invoiceId: Hex): Hex {
  return invoiceId; // for demo, just reuse the invoice id
}
