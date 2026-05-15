"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

const tabs = ["Profile", "Brand", "Settlement", "Tax", "Webhooks"] as const;
type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  const [active, setActive] = useState<Tab>("Profile");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Account, brand, settlement, tax, and webhook configuration."
      />

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0a0f0c] p-1.5 w-fit">
        {tabs.map((t) => {
          const isActive = active === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-[rgba(74,222,128,0.14)] text-[#4ade80]"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {active === "Profile" ? <ProfileTab /> : <PlaceholderTab name={active} />}
    </div>
  );
}

function ProfileTab() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-5 rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7"
    >
      <div>
        <div className="font-display text-lg font-semibold text-white">
          Account profile
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Your public-facing details and how you want funds settled.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your name">
          <input
            type="text"
            defaultValue="Mara Quint"
            className="dashboard-settings-input"
          />
        </Field>
        <Field label="Business name">
          <input
            type="text"
            defaultValue="Acme Storefront"
            className="dashboard-settings-input"
          />
        </Field>
        <Field label="Settlement chain">
          <select className="dashboard-settings-input" defaultValue="Base">
            <option>Base</option>
            <option>Solana</option>
            <option>Polygon</option>
            <option>Arbitrum</option>
            <option>Optimism</option>
          </select>
        </Field>
        <Field label="Settlement currency">
          <select className="dashboard-settings-input" defaultValue="USDC">
            <option value="USDC">USDC</option>
            <option value="EURC">EURC</option>
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[rgba(74,222,128,0.10)] pt-5">
        <button
          type="button"
          className="rounded-full border border-[rgba(255,255,255,0.1)] px-5 py-2 text-sm text-zinc-300 transition-colors hover:text-white hover:border-[rgba(255,255,255,0.2)]"
        >
          Cancel
        </button>
        <button type="submit" className="btn-pill-solid text-sm">
          Save changes
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
      </div>

      <style>{`
        .dashboard-settings-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0a0f0c;
          padding: 10px 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 160ms ease;
        }
        .dashboard-settings-input::placeholder { color: #52525b; }
        .dashboard-settings-input:focus { border-color: rgba(74,222,128,0.45); }
      `}</style>
    </form>
  );
}

function PlaceholderTab({ name }: { name: Tab }) {
  return (
    <div className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-7">
      <div className="font-display text-lg font-semibold text-white">
        {name}
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {name} settings are coming soon. Profile is the first surface available
        in this preview.
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
