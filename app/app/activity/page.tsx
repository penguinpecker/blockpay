"use client";

import { useState } from "react";
import { ExternalLink, FileCheck, X } from "lucide-react";
import {
  ActivityRow,
  type ActivityItem,
} from "@/components/userapp/activity-row";
import { Chip } from "@/components/userapp/chip";

type LineItem = { label: string; amount: number };

type Receipt = {
  merchant: string;
  lineItems: LineItem[];
  subtotal: number;
  fees: number;
  total: number;
  chain: string;
  txHash: string;
  ipfsCid: string;
};

type ActivityWithReceipt = ActivityItem & { receipt: Receipt };

type Group = { date: string; items: ActivityWithReceipt[] };

const groups: Group[] = [
  {
    date: "Today",
    items: [
      {
        id: "tx-001",
        kind: "sent",
        party: "Blue Bottle Coffee",
        memo: "Iced latte + croissant",
        amount: 11.25,
        status: "complete",
        timestamp: "9:42 AM",
        receipt: {
          merchant: "Blue Bottle Coffee",
          lineItems: [
            { label: "Iced latte", amount: 6.5 },
            { label: "Almond croissant", amount: 4.5 },
          ],
          subtotal: 11.0,
          fees: 0.25,
          total: 11.25,
          chain: "Arc",
          txHash:
            "0x9c1d4f8a2e1b7c9d3a4e5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
          ipfsCid: "bafybeibq3coffee7latte9stamp001alex",
        },
      },
      {
        id: "tx-002",
        kind: "received",
        party: "@sara",
        memo: "Dinner split",
        amount: 38.0,
        status: "complete",
        timestamp: "8:18 AM",
        receipt: {
          merchant: "@sara",
          lineItems: [{ label: "Dinner share", amount: 38.0 }],
          subtotal: 38.0,
          fees: 0,
          total: 38.0,
          chain: "Arc",
          txHash:
            "0x7b3a2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
          ipfsCid: "bafybeic2dinner4split6sara8stamp",
        },
      },
    ],
  },
  {
    date: "Yesterday",
    items: [
      {
        id: "tx-003",
        kind: "refund",
        party: "Saturn Outdoors",
        memo: "Returned jacket",
        amount: 120.0,
        status: "complete",
        timestamp: "4:02 PM",
        receipt: {
          merchant: "Saturn Outdoors",
          lineItems: [{ label: "Trail shell jacket — refund", amount: 120 }],
          subtotal: 120.0,
          fees: 0,
          total: 120.0,
          chain: "Ethereum",
          txHash:
            "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
          ipfsCid: "bafybei6saturn8refund0jacket2stamp",
        },
      },
    ],
  },
  {
    date: "May 1",
    items: [
      {
        id: "tx-004",
        kind: "sent",
        party: "@mike",
        memo: "Rent share",
        amount: 850.0,
        status: "complete",
        timestamp: "10:11 AM",
        receipt: {
          merchant: "@mike",
          lineItems: [{ label: "May rent share", amount: 850 }],
          subtotal: 850.0,
          fees: 0,
          total: 850.0,
          chain: "Solana",
          txHash:
            "5KqJxK8YfL3wV7n2tT1aBcD4eF5g6H7i8J9k0lMnOpQrStUvWxYz1aBcD2eF3g4h",
          ipfsCid: "bafybeirentshare4mike6may1stamp",
        },
      },
    ],
  },
  {
    date: "Apr 28",
    items: [
      {
        id: "tx-005",
        kind: "request",
        party: "@jen",
        memo: "Concert ticket",
        amount: 75.0,
        status: "pending",
        timestamp: "7:48 PM",
        receipt: {
          merchant: "@jen",
          lineItems: [{ label: "Concert ticket share", amount: 75 }],
          subtotal: 75.0,
          fees: 0,
          total: 75.0,
          chain: "Arc",
          txHash:
            "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          ipfsCid: "bafybei8concert0ticket2jen4stamp",
        },
      },
    ],
  },
];

const format = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const shortHash = (h: string) =>
  h.length > 14 ? `${h.slice(0, 8)}…${h.slice(-6)}` : h;

function ReceiptDrawer({
  item,
  onClose,
}: {
  item: ActivityWithReceipt;
  onClose: () => void;
}) {
  const { receipt } = item;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-md">
        <div className="card-frame relative overflow-hidden">
          <div className="flex items-start justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck
                  size={16}
                  strokeWidth={2.2}
                  className="text-[#4ade80]"
                />
                <h2
                  id="receipt-title"
                  className="font-display text-base font-semibold text-white"
                >
                  Receipt
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {receipt.merchant} · {item.timestamp}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt"
              className="rounded-full border border-[rgba(255,255,255,0.08)] p-1.5 text-zinc-400 transition-colors hover:border-[rgba(74,222,128,0.35)] hover:text-white"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>

          <div className="px-5 py-4">
            <ul className="flex flex-col gap-2">
              {receipt.lineItems.map((li, idx) => (
                <li
                  key={idx}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="truncate text-zinc-300">{li.label}</span>
                  <span className="font-display whitespace-nowrap font-semibold text-white">
                    ${format(li.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="my-4 dotted-hline" />

            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="text-zinc-200">${format(receipt.subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-zinc-500">Network fees</dt>
                <dd className="text-zinc-200">${format(receipt.fees)}</dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <dt className="font-display text-base font-semibold text-white">
                  Total
                </dt>
                <dd className="font-display text-base font-semibold text-[#4ade80]">
                  ${format(receipt.total)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <Chip tone="accent" className="self-start">
                {receipt.chain}
              </Chip>
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                      Tx hash
                    </div>
                    <div className="truncate font-mono text-xs text-zinc-200">
                      {shortHash(receipt.txHash)}
                    </div>
                  </div>
                  <ExternalLink
                    size={14}
                    strokeWidth={2}
                    className="text-zinc-500"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                      IPFS CID
                    </div>
                    <div className="truncate font-mono text-xs text-zinc-200">
                      {receipt.ipfsCid}
                    </div>
                  </div>
                  <ExternalLink
                    size={14}
                    strokeWidth={2}
                    className="text-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const openItem =
    groups
      .flatMap((g) => g.items)
      .find((i) => i.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Activity
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tap any transaction for the rendered receipt.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.date} aria-label={group.date}>
            <h2 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              {group.date}
            </h2>
            <ul className="card-frame-tight divide-y divide-[rgba(255,255,255,0.04)] px-1 py-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <ActivityRow
                    item={item}
                    onClick={() => setOpenId(item.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {openItem ? (
        <ReceiptDrawer item={openItem} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}
