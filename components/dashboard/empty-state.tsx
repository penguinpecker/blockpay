import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-10",
        className
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="grid h-14 w-14 place-items-center rounded-2xl border text-[var(--accent)]"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
            background: "color-mix(in srgb, var(--accent) 8%, transparent)",
          }}
        >
          <Icon size={26} strokeWidth={1.8} />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-[var(--fg)]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {body}
        </p>
        {cta ? (
          <Link href={cta.href} className="btn-pill-solid mt-6 text-sm">
            {cta.label}
            <ChevronRight size={16} strokeWidth={2.4} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
