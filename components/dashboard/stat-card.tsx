import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  hint,
  className,
}: StatCardProps) {
  const deltaColor =
    trend === "up"
      ? "text-emerald-300"
      : trend === "down"
      ? "text-rose-300"
      : "text-zinc-400";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-5",
        className
      )}
    >
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-3xl font-semibold tracking-tight text-white">
          {value}
        </div>
        {delta ? (
          <div className={cn("text-xs font-medium", deltaColor)}>{delta}</div>
        ) : null}
      </div>
      {hint ? (
        <div className="mt-1.5 text-xs text-zinc-500">{hint}</div>
      ) : null}
    </div>
  );
}
