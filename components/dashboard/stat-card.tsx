import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  /** "+12% this week" or similar. Color is driven by `trend`. */
  delta?: string;
  trend?: "up" | "down" | "flat";
  /**
   * 14-point sparkline series (any numeric scale). When omitted, no
   * sparkline renders — keeps empty merchants clean.
   */
  sparkline?: number[];
  /** Color override for the sparkline stroke. Defaults to var(--accent). */
  sparklineColor?: string;
  hint?: string;
  className?: string;
};

function Sparkline({
  values,
  color = "var(--accent)",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      // Inset 2px top/bottom so the stroke isn't clipped.
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg
      className="mt-3 block h-8 w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend = "flat",
  sparkline,
  sparklineColor,
  hint,
  className,
}: StatCardProps) {
  const deltaColor =
    trend === "up"
      ? "text-[var(--mint)]"
      : trend === "down"
      ? "text-[var(--warn)]"
      : "text-[var(--fg-subtle)]";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--border-active)]",
        className
      )}
    >
      <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)]">
        {label}
      </div>
      <div className="mt-3 font-display text-[56px] font-medium leading-[1.05] tracking-tight text-[var(--fg)] tnum">
        {value}
      </div>
      {delta ? (
        <div className={cn("mt-2 text-[11px] font-medium tnum", deltaColor)}>
          {delta}
        </div>
      ) : null}
      {sparkline && sparkline.length > 1 ? (
        <Sparkline values={sparkline} color={sparklineColor} />
      ) : null}
      {hint ? (
        <div className="mt-2 text-[11px] text-[var(--fg-subtle)]">{hint}</div>
      ) : null}
    </div>
  );
}
