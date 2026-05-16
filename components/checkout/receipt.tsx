import { cn } from "@/lib/utils";

export type ReceiptLine = {
  label: string;
  amount: string;
  emphasis?: boolean;
};

export type ReceiptMeta = {
  label: string;
  value: string;
  mono?: boolean;
  /** Optional full value revealed on hover via `title` attribute. */
  fullValue?: string;
};

export type StepState = "future" | "current" | "complete";

export type Step = {
  label: string;
  state: StepState;
};

/** Default 4-step rail for a payment lifecycle. */
export const DEFAULT_STEPS: Step[] = [
  { label: "Pay", state: "current" },
  { label: "Submit", state: "future" },
  { label: "Confirm", state: "future" },
  { label: "Settled", state: "future" },
];

/**
 * StepRail — 4 connected dots representing the payment lifecycle.
 * - future: hollow circle, --border
 * - current: hollow circle with --border-active + .step-glow
 * - complete: filled circle, --mint
 * Pass `shimmer` to apply a one-shot .tx-shimmer over the rail (e.g. on entering Confirm/Settled).
 */
export function StepRail({
  steps = DEFAULT_STEPS,
  shimmer = false,
  className,
}: {
  steps?: Step[];
  shimmer?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex w-full items-start justify-between gap-1 rounded-2xl border border-[var(--border)] bg-white/[0.015] px-4 py-4",
        shimmer && "tx-shimmer",
        className
      )}
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.label}
            className="relative flex flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              {/* leading connector (hidden on first) */}
              <span
                className={cn(
                  "h-px flex-1",
                  i === 0
                    ? "opacity-0"
                    : step.state === "future"
                      ? "bg-[var(--border)]"
                      : "bg-[var(--mint)]/60"
                )}
                aria-hidden="true"
              />
              {/* circle */}
              <span
                className={cn(
                  "relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                  step.state === "future" &&
                    "border-[var(--border-strong)] bg-transparent",
                  step.state === "current" &&
                    "border-[var(--accent-glow)] bg-transparent step-glow",
                  step.state === "complete" &&
                    "border-[var(--mint)] bg-[var(--mint)]"
                )}
                aria-hidden="true"
              >
                {step.state === "complete" ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="#052e16"
                    strokeWidth="2"
                  >
                    <path d="M3 6.5l2 2 4-4.5" />
                  </svg>
                ) : step.state === "current" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                ) : null}
              </span>
              {/* trailing connector (hidden on last) */}
              <span
                className={cn(
                  "h-px flex-1",
                  isLast
                    ? "opacity-0"
                    : steps[i + 1].state === "future" &&
                        step.state !== "complete"
                      ? "bg-[var(--border)]"
                      : "bg-[var(--mint)]/60"
                )}
                aria-hidden="true"
              />
            </div>
            <span
              className={cn(
                "mt-2 text-[10px] uppercase tracking-[0.18em]",
                step.state === "future"
                  ? "text-[var(--fg-subtle)]"
                  : step.state === "current"
                    ? "text-[var(--fg)]"
                    : "text-[var(--mint)]"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Receipt({
  lines,
  meta,
  className,
}: {
  lines: ReceiptLine[];
  meta?: ReceiptMeta[];
  className?: string;
}) {
  return (
    <div className={cn("card-frame-tight p-5", className)}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
        Order summary
      </div>
      <ul className="mt-3 divide-y divide-[var(--border)]">
        {lines.map((l) => (
          <li
            key={l.label}
            className={cn(
              "flex items-baseline justify-between gap-4 py-2.5",
              l.emphasis ? "pt-3" : ""
            )}
          >
            <span
              className={cn(
                "text-sm",
                l.emphasis
                  ? "font-display font-semibold text-[var(--fg)]"
                  : "text-[var(--fg-muted)]"
              )}
            >
              {l.label}
            </span>
            <span
              className={cn(
                "text-right tnum",
                l.emphasis
                  ? "font-display text-base font-semibold text-[var(--accent)]"
                  : "text-sm text-[var(--fg)]"
              )}
            >
              {l.amount}
            </span>
          </li>
        ))}
      </ul>

      {meta && meta.length > 0 ? (
        <>
          <div className="dotted-hline my-4 w-full" aria-hidden="true" />
          <dl className="grid gap-2 text-xs">
            {meta.map((m) => (
              <div
                key={m.label}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-[var(--fg-subtle)]">{m.label}</dt>
                <dd
                  className={cn(
                    "text-right text-[var(--fg)]",
                    m.mono ? "font-mono text-[11px]" : "tnum"
                  )}
                  title={m.fullValue}
                >
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </div>
  );
}
