"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Link2,
  Users,
  Banknote,
  Plug,
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
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Payouts", href: "/dashboard/payouts", icon: Banknote },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
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
    <aside className="hidden md:flex md:w-60 flex-col border-r border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="px-5 py-6 border-b border-[var(--border)]">
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
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-[var(--bg-elev)] text-[var(--fg)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elev)]/60"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-[var(--fg)]"
                        : "text-[var(--fg-subtle)] group-hover:text-[var(--fg)]"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] font-display text-xs font-bold text-[var(--accent-deep)]">
            AS
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-[var(--fg)]">
              Acme Storefront
            </div>
            <div className="truncate font-mono text-[11px] text-[var(--fg-subtle)]">
              {truncateAddress(accountAddress)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
