"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does BlockPay handle cross-chain payments?",
    a: "BlockPay routes customer payments through Circle's CCTP, allowing buyers to pay on any supported chain while you receive USDC on the chain of your choice. Funds settle in seconds with no wrapped-token risk.",
  },
  {
    q: "Do my customers need a native gas token to check out?",
    a: "No. BlockPay integrates Circle Paymaster so customers pay only in USDC — gas is sponsored. They never need to acquire ETH, SOL or any chain-native token.",
  },
  {
    q: "Can I accept tokens other than USDC?",
    a: "Yes. Via Bridge Kit your storefront can accept any major token at a live quote and you still settle in USDC or EURC. You set the slippage cap.",
  },
  {
    q: "Where are merchant funds custodied?",
    a: "Funds are held in a Circle Wallet you control. BlockPay is non-custodial — we never touch your balance and you can withdraw anytime.",
  },
  {
    q: "How long does Shopify and WordPress setup take?",
    a: "Two minutes. Install the BlockPay Shopify App or WordPress plugin, connect your wallet, paste your settlement address. You can take live USDC payments immediately.",
  },
  {
    q: "What does the on-chain receipt contain?",
    a: "Every payment carries a signed receipt with line items, totals, buyer and timestamp. The receipt is pinned to IPFS and referenced in the transaction memo, so wallets and explorers can render a human-readable statement.",
  },
];

export function FaqSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-5xl card-frame px-8 py-14 md:px-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            Why Choose BlockPay?
          </h2>
          <p className="mt-5 text-fg-muted">
            Offering a revolutionary alternative to traditional payment
            gateways. Below is a comprehensive comparison highlighting the
            advantages of choosing BlockPay over conventional options.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((f, i) => (
            <FaqItem key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`block w-full border bg-[var(--bg-card)] px-7 py-5 text-left transition-colors ${
        open
          ? "border-[var(--border-active)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]"
      }`}
      aria-expanded={open}
      style={{
        borderRadius: open ? 24 : 999,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-base text-fg">{q}</span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-accent"
          aria-hidden="true"
        >
          {open ? <Minus size={14} strokeWidth={2.4} /> : <Plus size={14} strokeWidth={2.4} />}
        </span>
      </div>
      {open && (
        <p className="mt-4 max-w-3xl text-sm text-fg-muted">{a}</p>
      )}
    </button>
  );
}
