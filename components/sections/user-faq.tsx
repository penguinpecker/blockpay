"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Do I need a crypto wallet?",
    a: "No. Sign in with your email and BlockPay creates a non-custodial smart account for you behind the scenes. If you already use a wallet like MetaMask or Phantom, you can connect that instead — both paths work.",
  },
  {
    q: "What chains are supported?",
    a: "USDC moves natively on Ethereum, Base, Arbitrum, Polygon, Avalanche and Solana via Circle CCTP. You can hold and spend USDC on any of them from the same account — BlockPay routes for you.",
  },
  {
    q: "Is BlockPay custodial?",
    a: "No. Funds live in a smart account controlled by your passkey or wallet. BlockPay can’t move your money. If you ever stop using the app, your USDC stays on-chain and is still yours.",
  },
  {
    q: "What does it cost?",
    a: "Sending and receiving USDC between users is free. Gas is sponsored by Circle Paymaster so you don’t pay network fees for everyday transfers. We may meter heavy use or premium features later — there is no charge today.",
  },
  {
    q: "How are receipts verifiable?",
    a: "Each payment generates an EIP-712 typed receipt signed by both parties and referenced on-chain via a content hash. Anyone — your accountant, your bank, a tax authority — can verify the receipt against the on-chain record without trusting BlockPay.",
  },
];

export function UserFaqSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-5xl card-frame px-8 py-14 md:px-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            Common questions
          </h2>
          <p className="mt-5 text-fg-muted">
            The basics about how BlockPay works for everyday payments.
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
