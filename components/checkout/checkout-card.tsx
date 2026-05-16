"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Zap,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ChainPills, type ChainId } from "./chain-pills";
import { TokenSelect, TokenDot, type TokenId } from "./token-select";
import { Receipt, StepRail, type ReceiptLine, type Step } from "./receipt";
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
  /** 32-byte hex used as the on-chain invoiceId arg to Router.pay(). When
   * set, overrides the random one — lets the indexer match the Settled
   * event back to a real Invoice row by onChainInvoiceId. */
  onChainInvoiceId?: `0x${string}`;
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

const CHAIN_DOTS: Record<ChainId, string> = {
  arc: "#4ade80",
  ethereum: "#a1a1aa",
  solana: "#a855f7",
};

const CHAIN_LABELS: Record<ChainId, string> = {
  arc: "Arc Testnet",
  ethereum: "Ethereum",
  solana: "Solana",
};

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

function isGaslessChainKey(k: string | undefined): k is "arc-testnet" {
  return k === "arc-testnet";
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

function userOpExplorerFor(_chainKey: "arc-testnet", hash: Hex): string {
  return `https://www.jiffyscan.xyz/userOpHash/${hash}`;
}

/** Derive the 4-step rail from the wallet/tx status. */
function stepsFor(status: Status, accountConnected: boolean): Step[] {
  // Order: Pay → Submit → Confirm → Settled
  // Pay = connect + token approval
  // Submit = paying/gasless submitting
  // Confirm = waiting receipt
  // Settled = success
  const future = (label: string): Step => ({ label, state: "future" });
  const current = (label: string): Step => ({ label, state: "current" });
  const complete = (label: string): Step => ({ label, state: "complete" });

  if (status.kind === "success") {
    return [
      complete("Pay"),
      complete("Submit"),
      complete("Confirm"),
      complete("Settled"),
    ];
  }
  if (status.kind === "paying") {
    return [complete("Pay"), complete("Submit"), current("Confirm"), future("Settled")];
  }
  if (status.kind === "gasless") {
    const isSubmitting =
      status.label === "Submitting…" ||
      status.label === "Signing…" ||
      status.label === "Funding test USDC…" ||
      status.label === "Preparing account…";
    if (isSubmitting) {
      return [complete("Pay"), current("Submit"), future("Confirm"), future("Settled")];
    }
    // waiting-receipt
    return [complete("Pay"), complete("Submit"), current("Confirm"), future("Settled")];
  }
  if (status.kind === "approving" || status.kind === "switching") {
    return [current("Pay"), future("Submit"), future("Confirm"), future("Settled")];
  }
  if (status.kind === "connecting") {
    return [current("Pay"), future("Submit"), future("Confirm"), future("Settled")];
  }
  if (accountConnected) {
    return [current("Pay"), future("Submit"), future("Confirm"), future("Settled")];
  }
  return [current("Pay"), future("Submit"), future("Confirm"), future("Settled")];
}

export function CheckoutCard({
  merchantName = "Acme Storefront",
  invoiceId,
  onChainInvoiceId,
  lineItems = DEFAULT_LINES,
  totalLabel = "$1.00 USDC",
  amountUsdc = parseUnits("1", 6),
  merchantAddress = DEMO_MERCHANT,
  onPay,
  payHref,
}: CheckoutCardProps) {
  const [token, setToken] = useState<TokenId>("USDC");
  const [chain, setChain] = useState<ChainId>("arc");
  const [account, setAccount] = useState<Address | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [showOther, setShowOther] = useState(false);
  const [shimmerOnce, setShimmerOnce] = useState(false);

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

  // Trigger one-shot shimmer when entering "Confirm" or "Settled" steps.
  useEffect(() => {
    const enteringConfirm =
      status.kind === "paying" ||
      (status.kind === "gasless" && status.label === "Confirming on-chain…");
    const enteringSettled = status.kind === "success";
    if (enteringConfirm || enteringSettled) {
      setShimmerOnce(true);
      const t = setTimeout(() => setShimmerOnce(false), 720);
      return () => clearTimeout(t);
    }
  }, [status]);

  const target = configForPill(chain as "arc" | "ethereum" | "solana");
  const isLive = target.status === "live-testnet" && target.chain !== null;
  const useGasless =
    isGaslessChainKey(target.chain?.key) && paymasterAvailable(target.chain.key);

  const steps = useMemo(() => stepsFor(status, Boolean(account)), [status, account]);

  const handlePrimaryClick = async () => {
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

      const currentChainId = await getChainId();
      if (currentChainId !== target.chain.chainId) {
        setStatus({ kind: "switching" });
        await ensureChain(target.chain);
      }

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

      const balance = (await pub.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [account],
      })) as bigint;

      if (balance < amountUsdc && target.chain.testUsdc === tokenAddress) {
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

      setStatus({ kind: "paying" });
      const invoice = onChainInvoiceId ?? randomInvoiceId();
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
          Connect
        </>
      );
    return (
      <>
        <Zap size={16} strokeWidth={2.4} />
        <span className="tnum">{`Pay ${totalLabel}`}</span>
      </>
    );
  };

  const isBusy =
    status.kind === "connecting" ||
    status.kind === "switching" ||
    status.kind === "approving" ||
    status.kind === "paying" ||
    status.kind === "gasless";

  // Default recommended method = USDC on the currently configured chain.
  const recommendedChain = target.chain?.name ?? CHAIN_LABELS[chain];

  return (
    <div className="card-frame card-active w-full max-w-md p-6 md:p-7">
      {/* Merchant strip — plain fg, no green word treatment */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elev)] font-display text-sm font-bold text-[var(--fg)]"
            aria-hidden="true"
          >
            {merchantName.charAt(0)}
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-[var(--fg)]">
              {merchantName}
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">
              {invoiceId ? `Invoice ${invoiceId}` : "Secure checkout"}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-pill text-[12px]"
          onClick={() => {
            if (!account && hasInjectedWallet()) {
              handlePrimaryClick();
            }
          }}
          aria-label={account ? "Wallet connected" : "Connect wallet"}
        >
          <Wallet size={14} strokeWidth={2.4} />
          {account
            ? `${account.slice(0, 6)}…${account.slice(-4)}`
            : "Connect"}
        </button>
      </div>

      {/* Order summary */}
      <div className="mt-5">
        <Receipt lines={lineItems} />
      </div>

      {/* Recommended payment method — hides chain pills + token select by default */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          <span>Method</span>
          {isLive ? (
            <span className="rounded-full border border-[var(--border-active)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-2 py-[2px] text-[9px] normal-case tracking-normal text-[var(--accent)]">
              Live testnet
            </span>
          ) : target.status === "coming-soon" ? (
            <span className="text-[9px] normal-case tracking-normal text-[var(--warn)]">
              Coming soon
            </span>
          ) : (
            <span className="text-[9px] normal-case tracking-normal text-[var(--fg-subtle)]">
              Non-EVM
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowOther((v) => !v)}
          className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border-active)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] px-4 py-3 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)]"
          aria-expanded={showOther}
        >
          <TokenDot token={token} size={20} />
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)]">
              Pay with
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
              <span className="tnum">{token}</span>
              <span className="text-[var(--fg-subtle)]">on</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: CHAIN_DOTS[chain] }}
                  aria-hidden="true"
                />
                {recommendedChain}
              </span>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`text-[var(--fg-subtle)] transition-transform duration-200 ${
              showOther ? "rotate-180" : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => setShowOther((v) => !v)}
          className="mt-2 text-[12px] text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
          aria-expanded={showOther}
        >
          {showOther ? "Hide other ways to pay" : "Other ways to pay"}
        </button>

        <div
          className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gridTemplateRows: showOther ? "1fr" : "0fr",
            opacity: showOther ? 1 : 0,
          }}
          aria-hidden={!showOther}
        >
          <div className="min-h-0">
            <div className="mt-3 space-y-3">
              <TokenSelect value={token} onChange={setToken} />
              <ChainPills value={chain} onChange={setChain} />
            </div>
          </div>
        </div>
      </div>

      {/* 4-step horizontal rail */}
      <div className="mt-5">
        <StepRail steps={steps} shimmer={shimmerOnce} />
      </div>

      {status.kind === "success" && (
        <div className="mt-5 space-y-2">
          <a
            href={status.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[var(--border-active)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-4 py-3 text-xs"
          >
            <span className="flex items-center gap-2 text-[var(--mint)]">
              <CheckCircle2 size={14} />
              Payment confirmed on-chain
            </span>
            <span className="flex items-center gap-1 text-[var(--fg)]">
              View tx <ExternalLink size={12} />
            </span>
          </a>
          {status.userOpHash && status.userOpExplorer && (
            <a
              href={status.userOpExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/[0.02] px-4 py-3 text-xs"
            >
              <span className="flex items-center gap-2 text-[var(--fg)]">
                <Zap size={14} className="text-[var(--accent)]" />
                <span
                  className="font-mono"
                  title={status.userOpHash}
                >
                  UserOp {status.userOpHash.slice(0, 6)}…{status.userOpHash.slice(-4)}
                </span>
              </span>
              <span className="flex items-center gap-1 text-[var(--fg-muted)]">
                Jiffyscan <ExternalLink size={12} />
              </span>
            </a>
          )}
        </div>
      )}

      {status.kind === "error" && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--warn)_6%,transparent)] px-4 py-3 text-xs text-[var(--warn)]">
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
        <div className="mt-3 text-center text-[10px] text-[var(--fg-subtle)]">
          Router:{" "}
          <a
            href={`${target.chain.explorerBase}/address/${target.chain.router}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--fg-muted)] underline-offset-2 hover:underline"
            title={target.chain.router}
          >
            {target.chain.router.slice(0, 6)}…{target.chain.router.slice(-4)}
          </a>{" "}
          on {target.chain.name}
        </div>
      )}

      <div className="mt-5 border-t border-[var(--border)] pt-4 text-center text-[11px] text-[var(--fg-subtle)]">
        Powered by BlockPay
      </div>
    </div>
  );
}
