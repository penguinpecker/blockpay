"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Wallet,
  Zap,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { ChainPills, type ChainId } from "./chain-pills";
import { TokenSelect, type TokenId } from "./token-select";
import { Receipt, type ReceiptLine } from "./receipt";
import {
  ROUTER_ABI,
  ERC20_ABI,
  configForPill,
  ensureChain,
  getChainId,
  hasInjectedWallet,
  publicClientFor,
  randomInvoiceId,
  mockReceiptCid,
  requestAccounts,
  walletClient,
} from "@/lib/web3";
import { paymasterAvailable } from "@/lib/paymaster";
import { payGasless, type GaslessStatus } from "@/lib/checkout-paymaster";
import { type Address, type Hex, parseUnits, zeroAddress } from "viem";

export type CheckoutCardProps = {
  merchantName?: string;
  invoiceId?: string;
  lineItems?: ReceiptLine[];
  totalLabel?: string;
  /** Amount in USDC units (6-decimal precision). Defaults to 1 USDC for the demo. */
  amountUsdc?: bigint;
  /** Merchant settlement address. Defaults to a demo address. */
  merchantAddress?: Address;
  onPay?: () => void;
  payHref?: string;
};

const DEFAULT_LINES: ReceiptLine[] = [
  { label: "Pro Plan – Monthly", amount: "$49.00" },
  { label: "Tax (8%)", amount: "$3.92" },
  { label: "Total", amount: "$52.92", emphasis: true },
];

const DEMO_MERCHANT: Address = "0x93c984f976569bccEaDBB6e973E0f7d62A8aD217";

type Status =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "switching" }
  | { kind: "approving" }
  | { kind: "paying" }
  | { kind: "gasless"; label: string; userOpHash?: Hex }
  | {
      kind: "success";
      txHash: Hex;
      explorer: string;
      userOpHash?: Hex;
      userOpExplorer?: string;
    }
  | { kind: "error"; message: string };

function isGaslessChainKey(k: string | undefined): k is "base-sepolia" | "arc-testnet" {
  return k === "base-sepolia" || k === "arc-testnet";
}

function gaslessStatusLabel(s: GaslessStatus): string {
  switch (s.kind) {
    case "preparing-sca":
      return "Preparing account…";
    case "minting-test-usdc":
      return "Funding test USDC…";
    case "signing-permit":
      return "Signing…";
    case "submitting":
      return "Submitting…";
    case "waiting-receipt":
      return "Confirming on-chain…";
  }
}

function userOpExplorerFor(chainKey: "base-sepolia" | "arc-testnet", hash: Hex): string {
  // Jiffyscan covers base-sepolia today; arc-testnet has no public AA
  // explorer yet, so we fall back to the same network param.
  const network = chainKey === "base-sepolia" ? "base-sepolia" : "base-sepolia";
  return `https://www.jiffyscan.xyz/userOpHash/${hash}?network=${network}`;
}

export function CheckoutCard({
  merchantName = "Acme Storefront",
  invoiceId,
  lineItems = DEFAULT_LINES,
  totalLabel = "$1.00 USDC",
  amountUsdc = parseUnits("1", 6),
  merchantAddress = DEMO_MERCHANT,
  onPay,
  payHref,
}: CheckoutCardProps) {
  const [token, setToken] = useState<TokenId>("USDC");
  const [chain, setChain] = useState<ChainId>("base");
  const [account, setAccount] = useState<Address | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (!hasInjectedWallet()) return;
    const eth = window.ethereum!;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAccount((accounts?.[0] as Address) ?? null);
    };
    eth.on("accountsChanged", onAccounts);
    return () => eth.removeListener("accountsChanged", onAccounts);
  }, []);

  const target = configForPill(chain as "arc" | "base" | "ethereum" | "solana");
  const isLive = target.status === "live-testnet" && target.chain !== null;
  const useGasless =
    isGaslessChainKey(target.chain?.key) && paymasterAvailable(target.chain.key);

  const handlePrimaryClick = async () => {
    // External demo override
    if (onPay) {
      onPay();
      return;
    }
    if (payHref && typeof window !== "undefined") {
      window.location.href = payHref;
      return;
    }

    if (!hasInjectedWallet()) {
      setStatus({
        kind: "error",
        message: "No wallet detected. Install MetaMask or a compatible wallet.",
      });
      return;
    }

    try {
      if (!account) {
        setStatus({ kind: "connecting" });
        const addr = await requestAccounts();
        setAccount(addr);
        setStatus({ kind: "idle" });
        return;
      }

      if (!target.chain) {
        setStatus({
          kind: "error",
          message:
            target.status === "coming-soon"
              ? "This chain is not live yet for BlockPay demos."
              : "Solana payments will land in a future release.",
        });
        return;
      }

      const tokenAddress =
        target.chain.testUsdc ?? target.chain.usdc ?? zeroAddress;
      const routerAddress = target.chain.router;
      if (!routerAddress || tokenAddress === zeroAddress) {
        setStatus({
          kind: "error",
          message: "Demo contracts are not configured on this chain yet.",
        });
        return;
      }

      // 1. Make sure wallet is on the target chain
      const currentChainId = await getChainId();
      if (currentChainId !== target.chain.chainId) {
        setStatus({ kind: "switching" });
        await ensureChain(target.chain);
      }

      // 1a. Gasless ERC-4337 path via Circle Paymaster — only when the chain
      //     has a bundler URL + Circle Paymaster v0.8 deployed.
      if (useGasless && isGaslessChainKey(target.chain.key)) {
        setStatus({ kind: "gasless", label: "Preparing account…" });
        const result = await payGasless({
          chainKey: target.chain.key,
          payerEoa: account,
          amountUsdc,
          merchantAddress,
          onStatus: (s) => {
            setStatus({
              kind: "gasless",
              label: gaslessStatusLabel(s),
              userOpHash: s.kind === "waiting-receipt" ? s.userOpHash : undefined,
            });
          },
        });
        setStatus({
          kind: "success",
          txHash: result.txHash,
          explorer: `${target.chain.explorerBase}/tx/${result.txHash}`,
          userOpHash: result.userOpHash,
          userOpExplorer: userOpExplorerFor(target.chain.key, result.userOpHash),
        });
        return;
      }

      const wallet = walletClient();
      const pub = publicClientFor(target.chain);

      // 2. Ensure allowance >= amount (testnet: mint TestUSDC first if balance is 0)
      const balance = (await pub.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [account],
      })) as bigint;

      if (balance < amountUsdc && target.chain.testUsdc === tokenAddress) {
        // Demo helper: mint enough TestUSDC so the visitor can pay.
        setStatus({ kind: "approving" });
        const mintHash = await wallet.writeContract({
          account,
          chain: null,
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "mint",
          args: [account, parseUnits("100", 6)],
        });
        await pub.waitForTransactionReceipt({ hash: mintHash });
      }

      const allowance = (await pub.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account, routerAddress],
      })) as bigint;

      if (allowance < amountUsdc) {
        setStatus({ kind: "approving" });
        const approveHash = await wallet.writeContract({
          account,
          chain: null,
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [routerAddress, parseUnits("10000", 6)],
        });
        await pub.waitForTransactionReceipt({ hash: approveHash });
      }

      // 3. Call router.pay()
      setStatus({ kind: "paying" });
      const invoice = randomInvoiceId();
      const payHash = await wallet.writeContract({
        account,
        chain: null,
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: "pay",
        args: [
          {
            invoiceId: invoice,
            token: tokenAddress,
            amount: amountUsdc,
            merchant: merchantAddress,
            memoCid: mockReceiptCid(invoice),
            splits: [],
          },
        ],
      });
      await pub.waitForTransactionReceipt({ hash: payHash });

      setStatus({
        kind: "success",
        txHash: payHash,
        explorer: `${target.chain.explorerBase}/tx/${payHash}`,
      });
    } catch (err: unknown) {
      const e = err as { shortMessage?: string; message?: string };
      const msg = e?.shortMessage ?? e?.message ?? "Transaction failed";
      // Strip RPC noise — first line only
      setStatus({ kind: "error", message: msg.split("\n")[0] });
    }
  };

  const buttonContent = () => {
    if (status.kind === "connecting")
      return (
        <>
          <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
          Connecting…
        </>
      );
    if (status.kind === "switching")
      return (
        <>
          <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
          Switching chain…
        </>
      );
    if (status.kind === "approving")
      return (
        <>
          <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
          Preparing token…
        </>
      );
    if (status.kind === "paying")
      return (
        <>
          <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
          Confirming on-chain…
        </>
      );
    if (status.kind === "gasless")
      return (
        <>
          <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
          {status.label}
        </>
      );
    if (status.kind === "success")
      return (
        <>
          <CheckCircle2 size={16} strokeWidth={2.4} />
          Paid · view tx
        </>
      );
    if (!account)
      return (
        <>
          <Wallet size={16} strokeWidth={2.4} />
          Connect wallet
        </>
      );
    return (
      <>
        <Zap size={16} strokeWidth={2.4} />
        {`Pay ${totalLabel}`}
      </>
    );
  };

  const isBusy =
    status.kind === "connecting" ||
    status.kind === "switching" ||
    status.kind === "approving" ||
    status.kind === "paying" ||
    status.kind === "gasless";

  return (
    <div className="card-frame glow-accent w-full max-w-md p-6 md:p-7">
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] font-display text-sm font-bold text-accent"
            aria-hidden="true"
          >
            {merchantName.charAt(0)}
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-white">
              {merchantName}
            </div>
            <div className="text-[11px] text-zinc-500">
              {invoiceId ? `Invoice ${invoiceId}` : "Secure checkout"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          <ShieldCheck size={12} className="text-accent" aria-hidden="true" />
          Secured
        </div>
      </div>

      <div className="mt-5">
        <Receipt lines={lineItems} />
      </div>

      <div className="mt-5">
        <TokenSelect value={token} onChange={setToken} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          <span>Chain</span>
          {isLive ? (
            <span className="rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.06)] px-2 py-[2px] text-[9px] normal-case tracking-normal text-accent">
              Live testnet
            </span>
          ) : target.status === "coming-soon" ? (
            <span className="text-[9px] normal-case tracking-normal text-amber-400">
              Coming soon
            </span>
          ) : (
            <span className="text-[9px] normal-case tracking-normal text-zinc-500">
              Non-EVM
            </span>
          )}
        </div>
        <ChainPills value={chain} onChange={setChain} />
      </div>

      {status.kind === "success" && (
        <div className="mt-5 space-y-2">
          <a
            href={status.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.08)] px-4 py-3 text-xs"
          >
            <span className="flex items-center gap-2 text-accent">
              <CheckCircle2 size={14} />
              Payment confirmed on-chain
            </span>
            <span className="flex items-center gap-1 text-zinc-300">
              View tx <ExternalLink size={12} />
            </span>
          </a>
          {status.userOpHash && status.userOpExplorer && (
            <a
              href={status.userOpExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs"
            >
              <span className="flex items-center gap-2 text-zinc-300">
                <Zap size={14} className="text-accent" />
                UserOp {status.userOpHash.slice(0, 6)}…{status.userOpHash.slice(-4)}
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                Jiffyscan <ExternalLink size={12} />
              </span>
            </a>
          )}
        </div>
      )}

      {status.kind === "error" && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-300">
          <AlertTriangle size={14} className="mt-[2px] shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePrimaryClick}
        disabled={isBusy}
        className="btn-pill-solid mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {buttonContent()}
      </button>

      {target.chain?.router && (
        <div className="mt-3 text-center text-[10px] text-zinc-600">
          Router:{" "}
          <a
            href={`${target.chain.explorerBase}/address/${target.chain.router}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline-offset-2 hover:underline"
          >
            {target.chain.router.slice(0, 6)}…{target.chain.router.slice(-4)}
          </a>{" "}
          on {target.chain.name}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Zap size={12} className="text-accent" aria-hidden="true" />
          Gas sponsored
        </span>
        <span>
          Powered by <span className="text-accent">BlockPay</span>
        </span>
      </div>
    </div>
  );
}
