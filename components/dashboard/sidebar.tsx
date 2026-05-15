"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Link2,
  Repeat,
  Users,
  Banknote,
  Undo2,
  Plug,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Payment links", href: "/dashboard/links", icon: Link2 },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Payouts", href: "/dashboard/payouts", icon: Banknote },
  { label: "Refunds", href: "/dashboard/refunds", icon: Undo2 },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { label: "Team", href: "/dashboard/team", icon: UserCog },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function truncateAddress(addr: string) {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const accountAddress = "0x9F4c2B7d1a83e5C0eA8fE26b9D71aD3e514BcA37";

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-[rgba(74,222,128,0.18)] bg-[#0a0f0c]">
      <div className="px-6 py-7 border-b border-[rgba(74,222,128,0.12)]">
        <Link href="/" aria-label="Blockpay home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-[rgba(74,222,128,0.10)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                  )}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-[#4ade80]" : "text-zinc-500"}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[rgba(74,222,128,0.12)] p-4">
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] px-3 py-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#86efac] to-[#22c55e] font-display text-sm font-bold text-[#052e16]">
            AS
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              Acme Storefront
            </div>
            <div className="truncate font-mono text-xs text-zinc-500">
              {truncateAddress(accountAddress)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
