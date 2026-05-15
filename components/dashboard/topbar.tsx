"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/payments": "Payments",
  "/dashboard/invoices": "Invoices",
  "/dashboard/links": "Payment links",
  "/dashboard/subscriptions": "Subscriptions",
  "/dashboard/customers": "Customers",
  "/dashboard/payouts": "Payouts",
  "/dashboard/refunds": "Refunds",
  "/dashboard/integrations": "Integrations",
  "/dashboard/team": "Team",
  "/dashboard/settings": "Settings",
};

function resolveTitle(pathname: string) {
  if (titleMap[pathname]) return titleMap[pathname];
  const match = Object.keys(titleMap)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? titleMap[match] : "Dashboard";
}

export function TopBar() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(74,222,128,0.18)] bg-black/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 lg:px-10 py-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Test mode
          </span>
        </div>

        <Link href="/dashboard/invoices" className="btn-pill-solid text-sm">
          <Plus size={16} strokeWidth={2.6} />
          New invoice
          <ChevronRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </header>
  );
}
