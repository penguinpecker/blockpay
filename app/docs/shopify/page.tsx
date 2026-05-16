import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export const metadata = {
  title: "Shopify integration — BlockPay docs",
  description:
    "Three ways to put BlockPay on a Shopify store: a drop-in theme button, a custom Shopify App built on @blockpay/shopify, and webhook event handling.",
};

const themeLiquidCode = `{%- comment -%}
  Paste into snippets/blockpay-button.liquid, then render it
  from cart.liquid:  {% render 'blockpay-button' %}
{%- endcomment -%}

<div id="blockpay-button"></div>
<script src="https://unpkg.com/@blockpay/shopify/theme" defer></script>`;

const themeInitCode = `<script>
  window.addEventListener("DOMContentLoaded", function () {
    BlockPayShopify.mount({
      apiKey: "{{ settings.blockpay_api_key }}",
      cart: window.cart,
      elementId: "blockpay-button",
    });
  });
</script>`;

const appInstallCode = `npm install @blockpay/shopify @blockpay/checkout`;

const appWebhookCode = `// app/routes/webhooks.blockpay.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { BlockPayShopify } from "@blockpay/shopify";

export async function action({ request }: ActionFunctionArgs) {
  const raw = await request.text();
  const sig = request.headers.get("X-BlockPay-Signature") ?? "";

  const bp = new BlockPayShopify({
    apiKey: process.env.BLOCKPAY_API_KEY!,
    shopDomain: "x.myshopify.com",
    webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET!,
  });

  if (!bp.webhooks.verify({ rawBody: raw, signature: sig })) {
    return new Response("Bad sig", { status: 401 });
  }

  const event = JSON.parse(raw);
  await bp.webhooks.routeEvent(event, {
    onPaymentReceived: async (data) => {
      // mark Shopify order paid via Admin API
      // data.invoiceId, data.txHash, data.amount
    },
  });

  return new Response("ok");
}`;

const appOrderSyncCode = `// Convert a Shopify order into a BlockPay invoice in one call.
const invoice = await bp.app.syncOrderToInvoice(shopifyOrder);

// The returned invoice carries the hosted checkout URL.
// Redirect the buyer there from your gateway's process_payment step.
return redirect(invoice.checkoutUrl);`;

const eventInvoiceCreated = `{
  "type": "invoice.created",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "arc-testnet",
    "checkoutUrl": "https://blockpay.dev/pay/inv_01HE2...",
    "shopifyOrderId": "gid://shopify/Order/1234567890"
  }
}`;

const eventInvoicePaid = `{
  "type": "invoice.paid",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "arc-testnet",
    "txHash": "0x9b1c...e3f0",
    "settledAt": 1715817600
  }
}`;

const eventPaymentReceived = `{
  "type": "payment.received",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "arc-testnet",
    "fromAddress": "0xCustomerWallet",
    "txHash": "0x9b1c...e3f0",
    "confirmations": 1
  }
}`;

const eventInvoiceExpired = `{
  "type": "invoice.expired",
  "data": {
    "invoiceId": "inv_01HE2...",
    "expiredAt": 1715819400,
    "reason": "ttl"
  }
}`;

const eventWebhookTest = `{
  "type": "webhook.test",
  "data": {
    "deliveredAt": 1715820000,
    "endpoint": "https://store.example.com/webhooks/blockpay"
  }
}`;

type Section = {
  id: string;
  title: string;
};

const sections: Section[] = [
  { id: "drop-in", title: "Drop-in button" },
  { id: "custom-app", title: "Custom Shopify App" },
  { id: "events", title: "Webhook events" },
];

type EventRow = {
  type: string;
  description: string;
  payload: string;
};

const events: EventRow[] = [
  {
    type: "invoice.created",
    description:
      "Fires the moment an invoice is generated for a Shopify order. Use this to record the BlockPay invoice id against the Shopify order before the buyer pays.",
    payload: eventInvoiceCreated,
  },
  {
    type: "invoice.paid",
    description:
      "Fires once the full invoice amount has settled on-chain and the indexer has reconciled it. This is the event you wire to your fulfilment pipeline.",
    payload: eventInvoicePaid,
  },
  {
    type: "payment.received",
    description:
      "Fires for each on-chain transfer attributed to the invoice. A short-paid invoice can produce many of these before invoice.paid fires.",
    payload: eventPaymentReceived,
  },
  {
    type: "invoice.expired",
    description:
      "Fires when an invoice passes its TTL with no settled transfer. Surface this back to the Shopify order as a cancelled payment attempt.",
    payload: eventInvoiceExpired,
  },
  {
    type: "webhook.test",
    description:
      "Sent from the BlockPay dashboard when you click Send test event. Use it to confirm signature verification before you trust live events.",
    payload: eventWebhookTest,
  },
];

export default function ShopifyPage() {
  return (
    <PaletteScope>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <ShoppingBag size={12} strokeWidth={2.4} />
              Shopify
            </span>
            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-accent">Shopify</span> integration.
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted">
              Two paths in. Drop a theme button into any store in five
              minutes, or build a full Shopify App on top of{" "}
              <InlineCode>@blockpay/shopify</InlineCode> with the SDK doing the
              ugly work.
            </p>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] px-5 py-4 text-sm text-fg">
              <span className="font-display text-xs uppercase tracking-[0.18em] text-accent">
                Beta
              </span>
              <span className="ml-3">
                The official Shopify App is in private beta and is not yet
                listed in the Shopify App Store. The drop-in button and the SDK
                below are production-ready today.
              </span>
            </div>

            <nav className="mt-12 flex flex-wrap gap-2 text-sm">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="btn-pill">
                  {s.title}
                  <ChevronRight size={14} strokeWidth={2.4} />
                </a>
              ))}
            </nav>

            <div className="mt-20 space-y-16">
              <Block
                id="drop-in"
                eyebrow="Option A"
                title="Drop-in theme button"
                subtitle="No app install, no engineering ticket, ~5 minutes."
              >
                <p className="text-fg-muted">
                  The fastest way to put a USDC checkout in front of a Shopify
                  customer. You either install the{" "}
                  <Link
                    href="https://apps.shopify.com/blockpay"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    BlockPay App Store entry
                  </Link>{" "}
                  (one-click), or paste the two snippets below into your
                  theme. The button takes the customer to BlockPay&apos;s
                  hosted <InlineCode>/pay/&lt;slug&gt;</InlineCode> page, so
                  there is nothing to self-host.
                </p>

                <Subhead>1. Render the mount point</Subhead>
                <p className="mt-3 text-fg-muted">
                  Save the snippet below as{" "}
                  <InlineCode>snippets/blockpay-button.liquid</InlineCode> and
                  render it from your <InlineCode>cart.liquid</InlineCode>{" "}
                  template wherever you want the button to appear.
                </p>
                <CodeBlock code={themeLiquidCode} label="cart.liquid" lang="liquid" />

                <Subhead>2. Initialise the button</Subhead>
                <p className="mt-3 text-fg-muted">
                  Add the init script to the same snippet. The API key is
                  pulled from your theme settings — never hard-code it.
                </p>
                <CodeBlock code={themeInitCode} label="blockpay-button.liquid" lang="liquid" />

                <p className="mt-6 text-fg-muted">
                  That is the full integration. The script reads{" "}
                  <InlineCode>window.cart</InlineCode>, asks the BlockPay API
                  for an invoice, and redirects the buyer to the hosted
                  checkout. On payment the buyer is sent back to your store&apos;s
                  thank-you URL and your{" "}
                  <Link
                    href="#events"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    webhook endpoint
                  </Link>{" "}
                  fires.
                </p>
              </Block>

              <Block
                id="custom-app"
                eyebrow="Option B"
                title="Custom Shopify App"
                subtitle="For teams building their own embedded Shopify app on BlockPay."
              >
                <p className="text-fg-muted">
                  If you maintain your own Shopify App — embedded or
                  headless — install the SDK and let it do the webhook
                  verification, event routing and order-to-invoice mapping.
                  The samples below assume a Remix Shopify App, which is the
                  template the Shopify CLI scaffolds today.
                </p>

                <Subhead>Install</Subhead>
                <CodeBlock code={appInstallCode} label="bash" lang="bash" />

                <Subhead>Webhook route</Subhead>
                <p className="mt-3 text-fg-muted">
                  Mount a single route that receives every BlockPay event and
                  dispatches it via{" "}
                  <InlineCode>bp.webhooks.routeEvent</InlineCode>. The SDK
                  verifies the HMAC signature in constant time before any
                  handler runs.
                </p>
                <CodeBlock code={appWebhookCode} label="webhooks.blockpay.tsx" lang="typescript" />

                <Subhead>Sync a Shopify order into an invoice</Subhead>
                <p className="mt-3 text-fg-muted">
                  When the buyer picks BlockPay at checkout, hand the Shopify
                  order to the SDK and it returns a ready-to-use invoice with
                  the hosted checkout URL.
                </p>
                <CodeBlock code={appOrderSyncCode} label="process_payment" lang="typescript" />
              </Block>

              <Block
                id="events"
                eyebrow="Reference"
                title="Webhook events"
                subtitle="Every event BlockPay can send to your Shopify integration."
              >
                <p className="text-fg-muted">
                  Each event arrives as a JSON POST with an{" "}
                  <InlineCode>X-BlockPay-Signature</InlineCode> header. The SDK
                  verifies and types the payload for you, but the raw schema
                  is below for anyone wiring this up by hand.
                </p>
                <div className="mt-8 space-y-10">
                  {events.map((e) => (
                    <EventCard key={e.type} event={e} />
                  ))}
                </div>
              </Block>
            </div>

            <div className="mt-20 flex flex-wrap gap-3">
              <Link href="/docs/sdk" className="btn-pill text-sm">
                SDK reference
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/docs/webhooks" className="btn-pill text-sm">
                All webhook events
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/docs/wordpress" className="btn-pill text-sm">
                WordPress / WooCommerce
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}

function Block({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <span className="font-display text-xs uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-fg-muted">{subtitle}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 font-display text-lg font-semibold text-fg">
      {children}
    </h3>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--bg-elev)] px-1.5 py-0.5 font-mono text-[13px] text-fg">
      {children}
    </code>
  );
}

function EventCard({ event }: { event: EventRow }) {
  return (
    <div className="card-frame-tight p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <code className="font-mono text-base text-accent">{event.type}</code>
        <span className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
          POST JSON
        </span>
      </div>
      <p className="mt-3 text-fg-muted">{event.description}</p>
      <CodeBlock code={event.payload} label="payload" lang="json" />
    </div>
  );
}

function CodeBlock({
  code,
  label,
  lang,
}: {
  code: string;
  label?: string;
  lang?: string;
}) {
  const lines = code.split("\n");
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      {label ? (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <span className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
            {label}
          </span>
          {lang ? (
            <span className="text-xs text-accent">{lang}</span>
          ) : (
            <span className="text-xs text-accent">@blockpay/shopify</span>
          )}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="select-none text-fg-subtle" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre text-fg">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
