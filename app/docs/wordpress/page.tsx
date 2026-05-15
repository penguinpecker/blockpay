import Link from "next/link";
import { ChevronRight, Boxes } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "WordPress / WooCommerce integration — BlockPay docs",
  description:
    "Install the BlockPay plugin in WooCommerce: six steps from download to a live USDC payment method in your store's checkout.",
};

type Step = {
  n: number;
  title: string;
  body: React.ReactNode;
  caption: string;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Download the BlockPay WooCommerce plugin",
    body: (
      <>
        Grab the latest <InlineCode>blockpay.zip</InlineCode> from{" "}
        <Link
          href="/plugins/woocommerce"
          className="text-accent underline-offset-4 hover:underline"
        >
          /plugins/woocommerce
        </Link>
        . The download page lists the current version and a changelog.
      </>
    ),
    caption: "Plugin download page",
  },
  {
    n: 2,
    title: "Upload it via WordPress admin",
    body: (
      <>
        In your WordPress admin, go to{" "}
        <InlineCode>Plugins → Add New → Upload Plugin</InlineCode>. Choose the{" "}
        <InlineCode>blockpay.zip</InlineCode> file and click Install Now.
      </>
    ),
    caption: "Upload Plugin screen",
  },
  {
    n: 3,
    title: "Activate the plugin",
    body: (
      <>
        After upload, click Activate. BlockPay registers itself as a
        WooCommerce payment gateway — no further plugin install required.
      </>
    ),
    caption: "Plugin list",
  },
  {
    n: 4,
    title: "Open the BlockPay settings",
    body: (
      <>
        Navigate to{" "}
        <InlineCode>
          WooCommerce → Settings → Payments → BlockPay
        </InlineCode>
        . You will see the gateway configuration form.
      </>
    ),
    caption: "Payments tab",
  },
  {
    n: 5,
    title: "Enter your settlement wallet and chain",
    body: (
      <>
        Paste your settlement wallet address — this is where USDC will land.
        Pick your preferred settlement chain (Arc or Base). Optionally set a
        display name customers see at checkout.
      </>
    ),
    caption: "Settings form",
  },
  {
    n: 6,
    title: "Save changes",
    body: (
      <>
        Click Save changes. BlockPay is now a live payment method in your
        store. Place a test order to confirm the checkout flow end-to-end.
      </>
    ),
    caption: "Saved confirmation",
  },
];

export default function WordPressPage() {
  return (
    <>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              <Boxes size={12} strokeWidth={2.4} />
              WordPress / WooCommerce
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Add <span className="text-accent">USDC checkout</span> to your
              WooCommerce store.
            </h1>
            <p className="mt-7 max-w-2xl text-zinc-300">
              Six steps from a zip file to a live USDC payment method.
              BlockPay plugs straight into the standard WooCommerce gateway
              flow.
            </p>

            <div className="mt-16 space-y-12">
              {steps.map((s) => (
                <StepRow key={s.n} step={s} />
              ))}
            </div>

            <section
              id="compatibility"
              className="mt-20 card-frame p-8 md:p-12 scroll-mt-24"
            >
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                <span className="text-accent">Compatibility</span>
              </h2>
              <p className="mt-5 max-w-2xl text-zinc-400">
                BlockPay works with WooCommerce 7.0+ and WordPress 6.0+. PHP
                8.1 or newer is recommended. The plugin is tested on the most
                recent two major versions of each — older versions may work
                but are not actively supported.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Spec label="WooCommerce" value="7.0 or newer" />
                <Spec label="WordPress" value="6.0 or newer" />
                <Spec label="PHP" value="8.1 or newer" />
              </div>
            </section>

            <div className="mt-16 flex flex-wrap gap-3">
              <Link href="/docs/quick-start" className="btn-pill text-sm">
                Back to quick start
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/plugins/woocommerce" className="btn-pill text-sm">
                Plugin download
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-frame-tight px-5 py-4">
      <div className="font-display text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 font-display text-lg font-semibold text-white">
        {value}
      </div>
    </div>
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

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[13px] text-zinc-300">
      {children}
    </code>
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
          <linearGradient id="wp-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0c1310" />
            <stop offset="100%" stopColor="#111a14" />
          </linearGradient>
          <pattern
            id="wp-grid"
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
        <rect width="640" height="360" fill="url(#wp-grad)" />
        <rect width="640" height="360" fill="url(#wp-grid)" />
        <rect
          x="0.5"
          y="0.5"
          width="639"
          height="359"
          fill="none"
          stroke="rgba(74,222,128,0.18)"
        />
        <rect x="0" y="0" width="160" height="360" fill="rgba(255,255,255,0.02)" />
        <rect x="24" y="32" width="100" height="10" rx="2" fill="rgba(255,255,255,0.1)" />
        <rect x="24" y="56" width="80" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
        <rect x="24" y="80" width="110" height="8" rx="2" fill="rgba(74,222,128,0.25)" />
        <rect x="24" y="104" width="90" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
        <rect x="184" y="32" width="200" height="14" rx="3" fill="rgba(74,222,128,0.18)" />
        <rect x="184" y="80" width="432" height="200" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(74,222,128,0.18)" />
        <rect x="204" y="108" width="160" height="10" rx="2" fill="rgba(255,255,255,0.12)" />
        <rect x="204" y="130" width="392" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="204" y="160" width="280" height="32" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(74,222,128,0.18)" />
        <rect x="204" y="232" width="120" height="32" rx="16" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.35)" />
        <text
          x="320"
          y="328"
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
