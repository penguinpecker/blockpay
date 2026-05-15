"use client";

import { useState } from "react";
import { Bell, Send as SendIcon } from "lucide-react";
import { Chip } from "@/components/userapp/chip";
import { cn } from "@/lib/utils";

type RequestStatus = "pending" | "paid" | "declined" | "expired";

type RequestItem = {
  id: string;
  party: string;
  handle: string;
  amount: number;
  memo: string;
  status: RequestStatus;
  timestamp: string;
};

const incoming: RequestItem[] = [
  {
    id: "req-i-1",
    party: "Jen Park",
    handle: "@jen",
    amount: 75,
    memo: "Concert ticket",
    status: "pending",
    timestamp: "2h ago",
  },
  {
    id: "req-i-2",
    party: "Coffee Club",
    handle: "@coffeeclub",
    amount: 12.5,
    memo: "Monthly dues",
    status: "pending",
    timestamp: "Yesterday",
  },
  {
    id: "req-i-3",
    party: "Mike Chen",
    handle: "@mike",
    amount: 220,
    memo: "Utilities April",
    status: "paid",
    timestamp: "May 2",
  },
];

const sent: RequestItem[] = [
  {
    id: "req-s-1",
    party: "Sara Liu",
    handle: "@sara",
    amount: 38,
    memo: "Dinner split",
    status: "paid",
    timestamp: "Yesterday",
  },
  {
    id: "req-s-2",
    party: "Theo Vance",
    handle: "@theo",
    amount: 50,
    memo: "Birthday pool",
    status: "pending",
    timestamp: "Apr 30",
  },
  {
    id: "req-s-3",
    party: "Mia Lopez",
    handle: "@mia",
    amount: 18,
    memo: "Cab fare",
    status: "declined",
    timestamp: "Apr 24",
  },
];

const statusTone: Record<RequestStatus, "accent" | "warning" | "muted"> = {
  pending: "warning",
  paid: "accent",
  declined: "muted",
  expired: "muted",
};

const formatAmount = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function RequestCard({
  item,
  variant,
}: {
  item: RequestItem;
  variant: "incoming" | "sent";
}) {
  return (
    <li className="card-frame-tight px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-white">
              {item.party}
            </span>
            <span className="truncate text-xs text-zinc-500">
              {item.handle}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{item.memo}</p>
        </div>
        <span className="font-display whitespace-nowrap text-base font-semibold text-white">
          ${formatAmount(item.amount)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip tone={statusTone[item.status]}>{item.status}</Chip>
          <span className="text-[11px] text-zinc-500">{item.timestamp}</span>
        </div>

        {item.status === "pending" ? (
          variant === "incoming" ? (
            <button
              type="button"
              className="btn-pill-solid px-4 py-1.5 text-xs"
            >
              Pay
            </button>
          ) : (
            <button
              type="button"
              className="btn-pill px-4 py-1.5 text-xs"
            >
              <Bell size={12} strokeWidth={2.4} />
              Remind
            </button>
          )
        ) : null}
      </div>
    </li>
  );
}

export default function RequestsPage() {
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");
  const items = tab === "incoming" ? incoming : sent;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Payment <span className="text-accent">requests</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track money asked for and owed.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Request direction"
        className="grid grid-cols-2 gap-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-1"
      >
        {(["incoming", "sent"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                active
                  ? "bg-[#4ade80] text-[#052e16]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="card-frame-tight flex flex-col items-center gap-2 px-6 py-10 text-center">
          <SendIcon size={24} strokeWidth={1.6} className="text-zinc-500" />
          <p className="text-sm text-zinc-400">No requests yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <RequestCard key={item.id} item={item} variant={tab} />
          ))}
        </ul>
      )}
    </div>
  );
}
