import { cn } from "@/lib/utils";

type ChipTone = "default" | "accent" | "muted" | "warning";

const toneStyles: Record<ChipTone, string> = {
  default:
    "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-zinc-300",
  accent:
    "border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.10)] text-[#4ade80]",
  muted: "border-[rgba(255,255,255,0.06)] bg-transparent text-zinc-400",
  warning:
    "border-[rgba(250,204,21,0.35)] bg-[rgba(250,204,21,0.10)] text-yellow-300",
};

export function Chip({
  children,
  tone = "default",
  className,
  as: As = "span",
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
  as?: "span" | "div" | "button";
}) {
  return (
    <As
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </As>
  );
}
