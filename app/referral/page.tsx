import Link from "next/link";
import { ChevronRight, Share2, UserPlus, Coins } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type Step = {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  step: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    Icon: Share2,
    step: "01",
    title: "Share your unique link",
    body: "Sign in to your dashboard and grab the referral link tied to your account. Share it anywhere — DMs, newsletters, a footer in your docs.",
  },
  {
    Icon: UserPlus,
    step: "02",
    title: "Merchant signs up and processes",
    body: "When a merchant signs up through your link and processes at least their first qualifying payment volume, the referral attaches to your account.",
  },
  {
    Icon: Coins,
    step: "03",
    title: "Earn USDC",
    body: "You earn a share of BlockPay's fee revenue from that merchant's first three months, paid out in USDC directly to the wallet on your account.",
  },
];

export default function ReferralPage() {
  return (
    <>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Referral Program
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Refer a merchant,{" "}
              <span className="text-accent">earn USDC</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              Bring real merchants on-chain. We share fee revenue, paid in
              stablecoins, straight to your wallet.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((s) => {
                const Icon = s.Icon;
                return (
                  <div
                    key={s.step}
                    className="card-frame flex h-full flex-col p-8"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
                        aria-hidden="true"
                      >
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-semibold text-white">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {s.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-10 py-12 text-center md:px-16">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Ready to <span className="text-accent">share</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">
              Sign up to grab your unique referral link from the dashboard.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="btn-pill-solid text-sm">
                Get your referral link
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
