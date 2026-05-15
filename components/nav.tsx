import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "./logo";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function Nav({ active = "Home" }: { active?: string }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-7">
        <Link href="/" aria-label="Blockpay home">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border px-2 py-2 md:flex"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {links.map((l) => {
            const isActive = l.label === active;
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#4ade80]"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/signup" className="btn-pill text-sm">
          Sign Up Free
          <ChevronRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </header>
  );
}
