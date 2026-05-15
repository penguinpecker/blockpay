import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  ScanLine,
  ChevronRight,
} from "lucide-react";
import { BalanceCard, type ChainBalance } from "@/components/userapp/balance-card";
import { ActionGrid, type Action } from "@/components/userapp/action-grid";
import {
  ActivityRow,
  type ActivityItem,
} from "@/components/userapp/activity-row";

const chains: ChainBalance[] = [
  { name: "Arc", amount: 1200, color: "#4ade80" },
  { name: "Base", amount: 800, color: "#3b82f6" },
  { name: "Ethereum", amount: 400, color: "#a78bfa" },
  { name: "Solana", amount: 447.3, color: "#f59e0b" },
];

const actions: Action[] = [
  { label: "Send", href: "/app/send", icon: ArrowUpRight },
  { label: "Receive", href: "/app/receive", icon: ArrowDownLeft },
  { label: "Request", href: "/app/requests", icon: Receipt },
  { label: "Pay", href: "/app/send?mode=pay", icon: ScanLine },
];

const recent: ActivityItem[] = [
  {
    id: "tx-001",
    kind: "sent",
    party: "Blue Bottle Coffee",
    memo: "Iced latte",
    amount: 6.5,
    status: "complete",
    timestamp: "9:42 AM",
  },
  {
    id: "tx-002",
    kind: "received",
    party: "@sara",
    memo: "Dinner split",
    amount: 38.0,
    status: "complete",
    timestamp: "Yesterday",
  },
  {
    id: "tx-003",
    kind: "refund",
    party: "Saturn Outdoors",
    memo: "Returned jacket",
    amount: 120.0,
    status: "complete",
    timestamp: "Mon",
  },
  {
    id: "tx-004",
    kind: "sent",
    party: "@mike",
    memo: "Rent share",
    amount: 850.0,
    status: "complete",
    timestamp: "May 1",
  },
  {
    id: "tx-005",
    kind: "request",
    party: "@jen",
    memo: "Concert ticket",
    amount: 75.0,
    status: "pending",
    timestamp: "Apr 28",
  },
];

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-6">
      <BalanceCard total={2847.3} chains={chains} />

      <ActionGrid actions={actions} />

      <section aria-labelledby="recent-activity">
        <div className="mb-2 flex items-center justify-between">
          <h2
            id="recent-activity"
            className="font-display text-base font-semibold text-white"
          >
            Recent activity
          </h2>
          <Link
            href="/app/activity"
            className="flex items-center gap-0.5 text-xs font-medium text-[#4ade80]"
          >
            View all
            <ChevronRight size={14} strokeWidth={2.4} />
          </Link>
        </div>

        <ul className="card-frame-tight divide-y divide-[rgba(255,255,255,0.04)] px-1 py-1">
          {recent.map((item) => (
            <li key={item.id}>
              <ActivityRow item={item} showStatus={false} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
