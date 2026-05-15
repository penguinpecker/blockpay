"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Wallet", href: "/app", icon: Wallet, match: (p: string) => p === "/app" },
  {
    label: "Send",
    href: "/app/send",
    icon: ArrowUpRight,
    match: (p: string) => p.startsWith("/app/send"),
  },
  {
    label: "Receive",
    href: "/app/receive",
    icon: ArrowDownLeft,
    match: (p: string) => p.startsWith("/app/receive"),
  },
  {
    label: "Activity",
    href: "/app/activity",
    icon: Activity,
    match: (p: string) => p.startsWith("/app/activity"),
  },
  {
    label: "Contacts",
    href: "/app/contacts",
    icon: Users,
    match: (p: string) => p.startsWith("/app/contacts"),
  },
];

export function BottomTabs() {
  const pathname = usePathname() ?? "/app";

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 mx-auto w-full max-w-md border-t border-[rgba(255,255,255,0.06)] bg-black/85 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur"
    >
      <ul className="grid grid-cols-5 gap-1">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-[#4ade80]"
                    : "text-zinc-500 hover:text-zinc-200",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
