import { config } from "dotenv";
config({ path: ".env.local" });

import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const pk = process.env.PRIVATE_KEY as `0x${string}` | undefined;
if (!pk) {
  console.error("PRIVATE_KEY missing from .env.local");
  process.exit(1);
}

const account = privateKeyToAccount(pk);
console.log("Derived address:");
console.log("  " + account.address);
console.log();

type Chain = { name: string; rpc: string | undefined };
const chains: Chain[] = [
  { name: "Arc testnet     ", rpc: process.env.ARC_TESTNET_RPC_URL },
  { name: "Base Sepolia    ", rpc: process.env.BASE_SEPOLIA_RPC_URL },
  { name: "Ethereum Sepolia", rpc: process.env.ETH_SEPOLIA_RPC_URL },
];

async function checkChain(c: Chain) {
  if (!c.rpc) {
    console.log(`[${c.name}] no RPC configured`);
    return;
  }
  try {
    const client = createPublicClient({ transport: http(c.rpc) });
    const [chainId, blockNumber, balance] = await Promise.all([
      client.getChainId(),
      client.getBlockNumber(),
      client.getBalance({ address: account.address }),
    ]);
    console.log(
      `[${c.name}] chainId=${chainId}  block=${blockNumber}  balance=${formatEther(balance)} (native)`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.log(`[${c.name}] RPC error: ${msg}`);
  }
}

(async () => {
  for (const c of chains) {
    await checkChain(c);
  }
})();
