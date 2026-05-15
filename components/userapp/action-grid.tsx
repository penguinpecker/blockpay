import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type Action = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function ActionGrid({ actions }: { actions: Action[] }) {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {actions.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <Link
            href={href}
            className="card-frame-tight flex flex-col items-center justify-center gap-2 px-2 py-4 transition-colors hover:border-[rgba(74,222,128,0.35)] hover:bg-[rgba(74,222,128,0.06)]"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(74,222,128,0.12)] text-[#4ade80]"
            >
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span className="text-xs font-semibold text-white">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
