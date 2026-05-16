/**
 * Canonical address book for BlockPay deployments. Updated as new chains
 * come online. The frontend reads from this to wire the checkout widget,
 * dashboard, and user-app surfaces to the right contract per chain.
 */

export type ChainKey =
  | "arc-testnet"
  | "arc"
  | "ethereum"
  | "optimism"
  | "arbitrum"
  | "polygon";

export type ChainConfig = {
  key: ChainKey;
  chainId: number;
  name: string;
  shortName: string;
  isTestnet: boolean;
  explorerBase: string;
  router: `0x${string}` | null;
  usdc: `0x${string}` | null;
  // For testnet demos we may also publish a Mock USDC. null means use real USDC.
  testUsdc?: `0x${string}` | null;
  /**
   * Circle Paymaster contract for EntryPoint v0.8. On-chain — no off-chain
   * URL needed. Customer signs an EIP-2612 USDC permit to this address so it
   * can pull USDC for gas.
   * Source: https://developers.circle.com/paymaster/addresses-and-events
   */
  circlePaymasterV08?: `0x${string}` | null;
  /** EntryPoint contract for the corresponding ERC-4337 version. */
  entryPointV08?: `0x${string}` | null;
};

/** ERC-4337 EntryPoint v0.8 is deployed at the same address on every chain. */
export const ENTRY_POINT_V08: `0x${string}` = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";

export const CHAINS: Record<ChainKey, ChainConfig> = {
  "arc-testnet": {
    key: "arc-testnet",
    chainId: 5042002,
    name: "Arc Testnet",
    shortName: "Arc testnet",
    isTestnet: true,
    explorerBase: "https://explorer.testnet.arc.network",
    router: "0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F",
    usdc: null,
    testUsdc: null,
    circlePaymasterV08: "0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966",
    entryPointV08: ENTRY_POINT_V08,
  },
  arc: {
    key: "arc",
    chainId: 0,
    name: "Arc",
    shortName: "Arc",
    isTestnet: false,
    explorerBase: "https://explorer.arc.network",
    router: null,
    usdc: null,
  },
  ethereum: {
    key: "ethereum",
    chainId: 1,
    name: "Ethereum",
    shortName: "Ethereum",
    isTestnet: false,
    explorerBase: "https://etherscan.io",
    router: null,
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  optimism: {
    key: "optimism",
    chainId: 10,
    name: "Optimism",
    shortName: "OP",
    isTestnet: false,
    explorerBase: "https://optimistic.etherscan.io",
    router: null,
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  },
  arbitrum: {
    key: "arbitrum",
    chainId: 42161,
    name: "Arbitrum One",
    shortName: "ARB",
    isTestnet: false,
    explorerBase: "https://arbiscan.io",
    router: null,
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    circlePaymasterV08: "0x0578cFB241215b77442a541325d6A4E6dFE700Ec",
    entryPointV08: ENTRY_POINT_V08,
  },
  polygon: {
    key: "polygon",
    chainId: 137,
    name: "Polygon",
    shortName: "Polygon",
    isTestnet: false,
    explorerBase: "https://polygonscan.com",
    router: null,
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
};

export const DEMO_CHAINS: ChainKey[] = ["arc-testnet"];
export const LIVE_DEMO_DEFAULT: ChainKey = "arc-testnet";

export function getChain(key: ChainKey): ChainConfig {
  return CHAINS[key];
}

export function getDemoChains(): ChainConfig[] {
  return DEMO_CHAINS.map((k) => CHAINS[k]);
}
