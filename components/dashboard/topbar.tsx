"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/payments": "Payments",
  "/dashboard/invoices": "Invoices",
  "/dashboard/links": "Payment links",
  "/dashboard/customers": "Customers",
  "/dashboard/payouts": "Payouts",
  "/dashboard/integrations": "Integrations",
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
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="flex h-[52px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[15px] font-medium tracking-tight text-[var(--fg)]">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--warn)]/30 bg-[var(--warn)]/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--warn)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--warn)]" />
            Test mode
          </span>
        </div>
      </div>
    </header>
  );
}
