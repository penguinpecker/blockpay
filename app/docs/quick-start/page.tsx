import Link from "next/link";
import { ChevronRight, ShoppingBag, Boxes, Code2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export const metadata = {
  title: "Quick start — BlockPay docs",
  description:
    "Three doors into BlockPay: Shopify one-click install, WordPress / WooCommerce plugin, or a custom JS integration.",
};

const codeSample = `import { BlockPay } from "@blockpay/checkout";

const bp = new BlockPay({ apiKey: process.env.BLOCKPAY_API_KEY! });

const invoice = await bp.invoices.create({
  amount: "49.00",
  currency: "USDC",
  merchantAddress: "0xYourSettlementWallet",
  lineItems: [{ label: "Pro Plan", amount: "49.00" }],
});

window.location.href = invoice.checkoutUrl;`;

export default function QuickStartPage() {
  return (
    <PaletteScope>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Quick start
            </span>
            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Take your first{" "}
              <span className="text-accent">stablecoin payment</span> in five
              minutes.
            </h1>
            <p className="mt-7 max-w-2xl text-base text-fg-muted">
              Pick the door that matches your stack. Each path ends with USDC
              landing in your settlement wallet on the chain you chose.
            </p>

            <nav className="mt-12 flex flex-wrap gap-3 text-sm">
              <a href="#shopify" className="btn-pill">
                Shopify
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#wordpress" className="btn-pill">
                WordPress / WooCommerce
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#custom-js" className="btn-pill">
                Custom JS
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
            </nav>

            <div className="mt-20 space-y-20">
              <Section
                id="shopify"
                Icon={ShoppingBag}
                eyebrow="Path 1"
                title="Shopify"
                blurb="A one-step install. No code, no DNS, no engineering ticket."
              >
                <ol className="mt-8 space-y-5">
                  <Step n={1}>Visit the BlockPay Shopify App listing.</Step>
                  <Step n={2}>Click Install on your store.</Step>
                  <Step n={3}>Paste your settlement wallet address.</Step>
                  <Step n={4}>
                    Accept USDC at checkout immediately. Funds settle to your
                    wallet on the chain you chose.
                  </Step>
                </ol>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/docs/shopify" className="btn-pill text-sm">
                    Full Shopify guide
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </Link>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                    Coming Soon
                  </span>
                  <Link
                    href="/signup"
                    className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Join the waitlist
                  </Link>
                </div>
              </Section>

              <Section
                id="wordpress"
                Icon={Boxes}
                eyebrow="Path 2"
                title="WordPress / WooCommerce"
                blurb="Drop our plugin into any WooCommerce store. Five clicks from zip-file to checkout."
              >
                <ol className="mt-8 space-y-5">
                  <Step n={1}>
                    Download the plugin from{" "}
                    <Link
                      href="/plugins/woocommerce"
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      /plugins/woocommerce
                    </Link>
                    .
                  </Step>
                  <Step n={2}>
                    Upload it through WP admin{" "}
                    <InlineCode>Plugins → Add New → Upload Plugin</InlineCode>.
                  </Step>
                  <Step n={3}>
                    Configure your settlement address under{" "}
                    <InlineCode>
                      WooCommerce → Settings → Payments → BlockPay
                    </InlineCode>
                    .
                  </Step>
                  <Step n={4}>Save. You are done.</Step>
                </ol>
                <div className="mt-8">
                  <Link href="/docs/wordpress" className="btn-pill text-sm">
                    Full WordPress guide
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </Link>
                </div>
              </Section>

              <Section
                id="custom-js"
                Icon={Code2}
                eyebrow="Path 3"
                title="Custom JS"
                blurb="A 12-line integration for any Node-backed app. Create an invoice, redirect to checkout, listen for the webhook."
              >
                <CodeBlock label="checkout.ts" code={codeSample} />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/docs/sdk" className="btn-pill text-sm">
                    Full SDK reference
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </Link>
                  <Link href="/docs/api" className="btn-pill text-sm">
                    REST API reference
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </Link>
                </div>
              </Section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}

function Section({
  id,
  Icon,
  eyebrow,
  title,
  blurb,
  children,
}: {
  id: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  eyebrow: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="card-frame p-8 md:p-12 scroll-mt-24">
      <div className="flex items-start gap-4">
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] text-accent"
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={2} />
        </span>
        <div>
          <div className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
            {eyebrow}
          </div>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-fg-muted">{blurb}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] font-display text-sm font-semibold text-accent"
        aria-hidden="true"
      >
        {n}
      </span>
      <span className="pt-1 text-fg">{children}</span>
    </li>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--bg-elev)] px-1.5 py-0.5 font-mono text-[13px] text-fg-muted">
      {children}
    </code>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const lines = code.split("\n");
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      {label ? (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <span className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
            {label}
          </span>
          <span className="text-xs text-accent">@blockpay/checkout</span>
        </div>
      ) : null}
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="select-none text-fg-subtle" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre text-fg-muted">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
