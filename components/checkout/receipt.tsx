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
};

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
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        Order summary
      </div>
      <ul className="mt-3 divide-y divide-white/5">
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
                  ? "font-display font-semibold text-white"
                  : "text-zinc-300"
              )}
            >
              {l.label}
            </span>
            <span
              className={cn(
                "text-right tabular-nums",
                l.emphasis
                  ? "font-display text-base font-semibold text-accent"
                  : "text-sm text-zinc-200"
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
                <dt className="text-zinc-500">{m.label}</dt>
                <dd
                  className={cn(
                    "text-right text-zinc-200",
                    m.mono ? "font-mono text-[11px]" : ""
                  )}
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
