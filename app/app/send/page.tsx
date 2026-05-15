"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Fuel, Users } from "lucide-react";
import { Chip } from "@/components/userapp/chip";

export default function SendPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-5"
    >
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Send <span className="text-accent">USDC</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Transfer to a handle, address, or contact.
        </p>
      </header>

      <Chip tone="accent" className="self-start">
        <Fuel size={12} strokeWidth={2.4} />
        Gas sponsored via Paymaster
      </Chip>

      <section className="card-frame-tight flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="recipient"
            className="text-xs font-medium uppercase tracking-widest text-zinc-500"
          >
            To
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="@handle, 0x address, or sara.eth"
            className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[rgba(74,222,128,0.45)]"
          />
          <Link
            href="/app/contacts"
            className="inline-flex items-center gap-1 self-start text-xs font-medium text-[#4ade80]"
          >
            <Users size={12} strokeWidth={2.4} />
            Pick from contacts
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="amount"
            className="text-xs font-medium uppercase tracking-widest text-zinc-500"
          >
            Amount
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3 focus-within:border-[rgba(74,222,128,0.45)]">
            <span className="font-display text-2xl font-semibold text-zinc-500">
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="font-display flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-zinc-700"
            />
            <span className="text-xs font-semibold text-zinc-400">USDC</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="memo"
            className="text-xs font-medium uppercase tracking-widest text-zinc-500"
          >
            Memo
          </label>
          <input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="What's this for?"
            maxLength={120}
            className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[rgba(74,222,128,0.45)]"
          />
        </div>
      </section>

      <button type="submit" className="btn-pill-solid justify-center text-sm">
        Confirm
        <ChevronRight size={16} strokeWidth={2.4} />
      </button>
    </form>
  );
}
