"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Fingerprint,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const HANDLE = "@alex.bp";
const NAME = "Alex Rivera";
const EMAIL = "alex@rivera.work";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        checked
          ? "border-[rgba(74,222,128,0.6)] bg-[rgba(74,222,128,0.30)]"
          : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-4 w-4 rounded-full transition-transform",
          checked
            ? "translate-x-6 bg-[#4ade80]"
            : "translate-x-1 bg-zinc-500",
        )}
      />
    </button>
  );
}

function Row({
  icon: Icon,
  label,
  hint,
  trailing,
}: {
  icon: typeof Bell;
  label: string;
  hint?: string;
  trailing: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(74,222,128,0.10)] text-[#4ade80]"
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        {hint ? (
          <div className="text-xs text-zinc-500">{hint}</div>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

export default function SettingsPage() {
  const [passkey, setPasskey] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [notifyRequests, setNotifyRequests] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-6"
    >
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Profile, security, and notifications.
        </p>
      </header>

      <section
        aria-labelledby="profile-heading"
        className="card-frame px-5 py-5"
      >
        <h2
          id="profile-heading"
          className="text-[11px] font-medium uppercase tracking-widest text-zinc-500"
        >
          Profile
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#86efac] to-[#22c55e] text-base font-bold text-[#052e16]"
          >
            A
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">{NAME}</div>
            <div className="text-xs text-zinc-500">{HANDLE}</div>
          </div>
          <button type="button" className="btn-pill px-3 py-1.5 text-xs">
            Edit
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <Row
            icon={Mail}
            label="Email"
            hint={EMAIL}
            trailing={
              <ChevronRight
                size={14}
                strokeWidth={2}
                className="text-zinc-600"
              />
            }
          />
          <Row
            icon={UserRound}
            label="Display handle"
            hint={HANDLE}
            trailing={
              <ChevronRight
                size={14}
                strokeWidth={2}
                className="text-zinc-600"
              />
            }
          />
        </div>
      </section>

      <section
        aria-labelledby="security-heading"
        className="card-frame px-5 py-5"
      >
        <h2
          id="security-heading"
          className="text-[11px] font-medium uppercase tracking-widest text-zinc-500"
        >
          Security
        </h2>
        <div className="mt-3 flex flex-col divide-y divide-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <Row
            icon={Fingerprint}
            label="Passkey sign-in"
            hint="Use Face ID or Touch ID"
            trailing={
              <Toggle
                checked={passkey}
                onChange={setPasskey}
                label="Toggle passkey sign-in"
              />
            }
          />
          <Row
            icon={ShieldCheck}
            label="Two-factor authentication"
            hint="One-time codes via authenticator"
            trailing={
              <Toggle
                checked={twoFa}
                onChange={setTwoFa}
                label="Toggle two-factor authentication"
              />
            }
          />
          <Row
            icon={KeyRound}
            label="Recovery key"
            hint="Last rotated 24 days ago"
            trailing={
              <ChevronRight
                size={14}
                strokeWidth={2}
                className="text-zinc-600"
              />
            }
          />
        </div>
      </section>

      <section
        aria-labelledby="notify-heading"
        className="card-frame px-5 py-5"
      >
        <h2
          id="notify-heading"
          className="text-[11px] font-medium uppercase tracking-widest text-zinc-500"
        >
          Notifications
        </h2>
        <div className="mt-3 flex flex-col divide-y divide-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <Row
            icon={Smartphone}
            label="Payment activity"
            hint="Push alerts for sends and receives"
            trailing={
              <Toggle
                checked={notifyPayments}
                onChange={setNotifyPayments}
                label="Toggle payment activity notifications"
              />
            }
          />
          <Row
            icon={Bell}
            label="Payment requests"
            hint="When someone asks you to pay"
            trailing={
              <Toggle
                checked={notifyRequests}
                onChange={setNotifyRequests}
                label="Toggle payment request notifications"
              />
            }
          />
          <Row
            icon={Mail}
            label="Product updates"
            hint="Occasional news and feature announcements"
            trailing={
              <Toggle
                checked={notifyMarketing}
                onChange={setNotifyMarketing}
                label="Toggle product update emails"
              />
            }
          />
        </div>
      </section>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-[rgba(248,113,113,0.14)]"
      >
        <LogOut size={14} strokeWidth={2.4} />
        Sign out
      </button>
    </form>
  );
}
