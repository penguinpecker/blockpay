import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Shopify integration — BlockPay docs",
  description:
    "Install BlockPay on your Shopify store: seven steps from the App Store listing to a live Pay with crypto button at checkout.",
};

type Step = {
  n: number;
  title: string;
  body: string;
  caption: string;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Find BlockPay in the Shopify App Store",
    body: "Open the Shopify App Store and search for BlockPay. Open the listing and confirm you are looking at the official BlockPay app — the publisher should read BlockPay Labs.",
    caption: "App Store listing",
  },
  {
    n: 2,
    title: "Click Add app, accept the permissions",
    body: "Shopify will ask you to confirm the requested scopes (read orders, write order metadata, read shop info). These are the minimum required to attach a USDC payment to an order.",
    caption: "Permissions screen",
  },
  {
    n: 3,
    title: "Open Apps → BlockPay → Settings in your admin",
    body: "Once installed, BlockPay shows up under your store admin Apps section. Click into it and select Settings.",
    caption: "Admin settings",
  },
  {
    n: 4,
    title: "Paste your settlement wallet address",
    body: "This is the wallet where you will receive USDC. We support any EVM-compatible address — a Safe, a hardware wallet, or a hot wallet. You can change this later.",
    caption: "Settlement address",
  },
  {
    n: 5,
    title: "Choose a settlement chain",
    body: "Pick Arc for the cheapest fees or Base for the largest USDC liquidity. Customers can still pay from any supported chain — we bridge for them via CCTP.",
    caption: "Chain picker",
  },
  {
    n: 6,
    title: "Toggle Enable BlockPay checkout",
    body: "Flip the switch. BlockPay now appears as a payment option in your store's checkout flow.",
    caption: "Enable toggle",
  },
  {
    n: 7,
    title: "Customers see Pay with crypto at checkout",
    body: "That's it. Your customers see a Pay with crypto option, scan the QR or connect a wallet, and the order is marked paid in Shopify as soon as the transfer confirms on-chain.",
    caption: "Live checkout",
  },
];

export default function ShopifyPage() {
  return (
    <>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              <ShoppingBag size={12} strokeWidth={2.4} />
              Shopify
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Add <span className="text-accent">USDC checkout</span> to your
              Shopify store.
            </h1>
            <p className="mt-7 max-w-2xl text-zinc-300">
              Seven steps. No code, no DNS, no engineering ticket. Funds settle
              directly to a wallet you control.
            </p>

            <div className="mt-16 space-y-12">
              {steps.map((s) => (
                <StepRow key={s.n} step={s} />
              ))}
            </div>

            <section
              id="dev-stores"
              className="mt-20 card-frame p-8 md:p-12 scroll-mt-24"
            >
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Testing on a{" "}
                <span className="text-accent">development store</span>?
              </h2>
              <p className="mt-5 max-w-2xl text-zinc-400">
                Use our test installation link to drop BlockPay into any
                Shopify development store. Test mode points at the BlockPay
                sandbox, so transfers settle in test USDC on Base Sepolia or
                Arc Sepolia — no real funds at risk.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="btn-pill text-sm opacity-70">
                  Test installation link
                  <ChevronRight size={14} strokeWidth={2.4} />
                </span>
                <Link href="/contact" className="btn-pill text-sm">
                  Request access
                  <ChevronRight size={14} strokeWidth={2.4} />
                </Link>
              </div>
            </section>

            <div className="mt-16 flex flex-wrap gap-3">
              <Link href="/docs/quick-start" className="btn-pill text-sm">
                Back to quick start
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/docs/webhooks" className="btn-pill text-sm">
                Listen for order webhooks
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function StepRow({ step }: { step: Step }) {
  return (
    <div
      id={`step-${step.n}`}
      className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr] scroll-mt-24"
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] font-display text-sm font-semibold text-accent"
            aria-hidden="true"
          >
            {step.n}
          </span>
          <span className="font-display text-xs uppercase tracking-[0.18em] text-zinc-500">
            Step {step.n}
          </span>
        </div>
        <h2
          id={`s-${step.n}`}
          className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {step.title}
        </h2>
        <p className="mt-4 text-zinc-400">{step.body}</p>
      </div>
      <ScreenshotPlaceholder caption={step.caption} />
    </div>
  );
}

function ScreenshotPlaceholder({ caption }: { caption: string }) {
  return (
    <figure className="card-frame-tight overflow-hidden p-0">
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Screenshot placeholder — ${caption}`}
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id="ph-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0c1310" />
            <stop offset="100%" stopColor="#111a14" />
          </linearGradient>
          <pattern
            id="ph-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(74,222,128,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="640" height="360" fill="url(#ph-grad)" />
        <rect width="640" height="360" fill="url(#ph-grid)" />
        <rect
          x="0.5"
          y="0.5"
          width="639"
          height="359"
          fill="none"
          stroke="rgba(74,222,128,0.18)"
        />
        <rect x="24" y="24" width="120" height="14" rx="3" fill="rgba(74,222,128,0.18)" />
        <rect x="24" y="50" width="220" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="24" y="68" width="180" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="24" y="120" width="592" height="160" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(74,222,128,0.18)" />
        <rect x="48" y="148" width="180" height="12" rx="3" fill="rgba(255,255,255,0.12)" />
        <rect x="48" y="170" width="260" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="48" y="188" width="240" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="48" y="232" width="120" height="32" rx="16" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.35)" />
        <text
          x="320"
          y="320"
          textAnchor="middle"
          fill="#71717a"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fontSize="12"
          letterSpacing="2"
        >
          SCREENSHOT
        </text>
      </svg>
      <figcaption className="border-t border-[rgba(74,222,128,0.18)] px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
        {caption}
      </figcaption>
    </figure>
  );
}
