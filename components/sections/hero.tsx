import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IlloGlobeShield } from "../illustrations";

const partners = [
  { name: "aws", style: "font-bold text-lg italic" },
  { name: "access", style: "font-medium italic tracking-wide" },
  { name: "PayPal", style: "font-bold italic" },
  { name: "AMEX", style: "font-bold tracking-widest" },
  { name: "MySQL", style: "font-semibold italic" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-8 pt-44 pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Revolutionize Web3
              <br />
              Payments <span className="font-light">with</span>
              <br />
              <span className="text-accent">BlockPay</span>
            </h1>
            <p className="mt-8 max-w-md text-base text-zinc-300">
              Simplify Transactions, Empower Decentralization.
            </p>
            <div className="mt-10">
              <Link href="/signup" className="btn-pill text-sm">
                Get Started Now
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 opacity-50">
              {partners.map((p) => (
                <span
                  key={p.name}
                  className={`text-zinc-400 ${p.style}`}
                  aria-hidden="true"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.15),transparent_60%)] blur-2xl" />
            <IlloGlobeShield className="relative" />
          </div>
        </div>
      </div>
    </section>
  );
}
