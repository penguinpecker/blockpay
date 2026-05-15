import {
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "./chip";

export type ActivityKind = "sent" | "received" | "refund" | "request";
export type ActivityStatus = "complete" | "pending" | "failed";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  party: string;
  memo: string;
  amount: number;
  status: ActivityStatus;
  timestamp: string;
};

const kindMeta: Record<
  ActivityKind,
  { icon: LucideIcon; tint: string; bg: string; sign: "+" | "-" | ""; label: string }
> = {
  sent: {
    icon: ArrowUpRight,
    tint: "text-red-300",
    bg: "bg-[rgba(248,113,113,0.10)]",
    sign: "-",
    label: "Sent",
  },
  received: {
    icon: ArrowDownLeft,
    tint: "text-[#4ade80]",
    bg: "bg-[rgba(74,222,128,0.12)]",
    sign: "+",
    label: "Received",
  },
  refund: {
    icon: RotateCcw,
    tint: "text-sky-300",
    bg: "bg-[rgba(56,189,248,0.12)]",
    sign: "+",
    label: "Refund",
  },
  request: {
    icon: Receipt,
    tint: "text-yellow-300",
    bg: "bg-[rgba(250,204,21,0.12)]",
    sign: "",
    label: "Request",
  },
};

const statusTone: Record<ActivityStatus, "accent" | "muted" | "warning"> = {
  complete: "accent",
  pending: "warning",
  failed: "muted",
};

const formatAmount = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function ActivityRow({
  item,
  onClick,
  showStatus = true,
}: {
  item: ActivityItem;
  onClick?: () => void;
  showStatus?: boolean;
}) {
  const meta = kindMeta[item.kind];
  const Icon = meta.icon;

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          meta.bg,
          meta.tint,
        )}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {item.party}
          </span>
          <span
            className={cn(
              "font-display whitespace-nowrap text-sm font-semibold",
              item.kind === "sent" ? "text-white" : "text-[#4ade80]",
            )}
          >
            {meta.sign}${formatAmount(item.amount)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-zinc-500">{item.memo}</span>
          <span className="whitespace-nowrap text-xs text-zinc-500">
            {item.timestamp}
          </span>
        </div>
        {showStatus ? (
          <div className="mt-2">
            <Chip tone={statusTone[item.status]}>{item.status}</Chip>
          </div>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-[rgba(74,222,128,0.18)] hover:bg-[rgba(74,222,128,0.04)]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-3 px-3 py-3">{content}</div>
  );
}
