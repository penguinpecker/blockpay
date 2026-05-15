import { cn } from "@/lib/utils";

export type StatusVariant = "success" | "pending" | "failed" | "refunded";

const variants: Record<StatusVariant, { dot: string; pill: string; label: string }> = {
  success: {
    dot: "bg-emerald-400",
    pill: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
    label: "Succeeded",
  },
  pending: {
    dot: "bg-amber-300",
    pill: "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
    label: "Pending",
  },
  failed: {
    dot: "bg-rose-400",
    pill: "border-rose-400/30 bg-rose-400/[0.08] text-rose-300",
    label: "Failed",
  },
  refunded: {
    dot: "bg-zinc-400",
    pill: "border-zinc-500/30 bg-zinc-500/[0.10] text-zinc-300",
    label: "Refunded",
  },
};

type StatusPillProps = {
  variant: StatusVariant;
  label?: string;
  className?: string;
};

export function StatusPill({ variant, label, className }: StatusPillProps) {
  const v = variants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        v.pill,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
      {label ?? v.label}
    </span>
  );
}
