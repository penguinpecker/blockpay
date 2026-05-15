import Link from "next/link";
import { Logo } from "@/components/logo";
import { BottomTabs } from "@/components/userapp/bottom-tabs";

const HANDLE = "@alex.bp";
const AVATAR_INITIALS = "A";

export default function UserAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-black/85 px-4 py-3 backdrop-blur">
          <Link href="/app" aria-label="Wallet home" className="-ml-1">
            <Logo />
          </Link>

          <Link
            href="/app/settings"
            className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] py-1 pl-1 pr-3 transition-colors hover:border-[rgba(74,222,128,0.35)]"
            aria-label="Account settings"
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#86efac] to-[#22c55e] text-xs font-bold text-[#052e16]"
            >
              {AVATAR_INITIALS}
            </span>
            <span className="text-xs font-semibold text-white">{HANDLE}</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
          {children}
        </main>

        <BottomTabs />
      </div>
    </div>
  );
}
