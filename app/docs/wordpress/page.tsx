import Link from "next/link";
import { ChevronRight, Boxes } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export const metadata = {
  title: "WordPress / WooCommerce integration — BlockPay docs",
  description:
    "Three ways to put BlockPay on a WordPress site: the official WooCommerce plugin, a custom WC_Payment_Gateway on the blockpay/woocommerce SDK, and a standalone PHP integration for non-WooCommerce sites.",
};

const pluginSettings: { name: string; description: string }[] = [
  {
    name: "API key",
    description:
      "Your BlockPay secret key from dashboard.blockpay.dev → Developers. Stored in wp_options, never echoed back to the front-end.",
  },
  {
    name: "Settlement wallet",
    description:
      "The address that receives USDC. Any EVM-compatible address — a Safe, a hardware wallet or a hot wallet.",
  },
  {
    name: "Settlement chain",
    description:
      "Where you receive funds. Pick Arc for cheapest fees or Base for the largest USDC liquidity. Customers can still pay from any supported chain.",
  },
  {
    name: "Webhook secret",
    description:
      "The shared secret used to sign incoming webhooks. The plugin validates every event before it touches the order.",
  },
];

const composerInstall = `composer require blockpay/woocommerce`;

const customGatewayCode = `<?php
// wp-content/plugins/my-shop/includes/class-wc-mycustom-blockpay.php
use BlockPay\\WooCommerce\\Client;
use BlockPay\\WooCommerce\\WooHelpers;

class WC_MyCustomBlockPay_Gateway extends WC_Payment_Gateway {
    public function __construct() {
        $this->id                 = 'mycustom_blockpay';
        $this->method_title       = 'Pay with USDC (custom)';
        $this->has_fields         = false;
        $this->supports           = ['products', 'refunds'];
        $this->init_form_fields();
        $this->init_settings();
    }

    public function process_payment($order_id) {
        $order   = wc_get_order($order_id);
        $bp      = new Client(get_option('blockpay_api_key'));
        $invoice = $bp->createInvoice(
            WooHelpers::orderToInvoiceInput($order)
        );

        $order->update_status(
            'pending',
            __('Awaiting BlockPay settlement.', 'my-shop')
        );

        return [
            'result'   => 'success',
            'redirect' => $invoice->checkoutUrl,
        ];
    }
}`;

const webhookHandlerCode = `<?php
// wp-content/plugins/my-shop/includes/blockpay-webhooks.php
use BlockPay\\WooCommerce\\Webhooks;

add_action('rest_api_init', function () {
    register_rest_route('my-shop/v1', '/blockpay-webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'my_shop_handle_blockpay_event',
    ]);
});

function my_shop_handle_blockpay_event(WP_REST_Request $req) {
    $raw       = $req->get_body();
    $signature = $req->get_header('x_blockpay_signature') ?? '';

    $verified = Webhooks::verify([
        'raw_body'  => $raw,
        'signature' => $signature,
        'secret'    => get_option('blockpay_webhook_secret'),
    ]);

    if (!$verified) {
        return new WP_REST_Response('bad signature', 401);
    }

    $event = json_decode($raw, true);
    if ($event['type'] === 'invoice.paid') {
        $order_id = $event['data']['metadata']['order_id'] ?? null;
        if ($order_id) {
            $order = wc_get_order((int) $order_id);
            $order->payment_complete($event['data']['txHash']);
        }
    }

    return new WP_REST_Response('ok', 200);
}`;

const standaloneShortcodeCode = `<?php
// Standalone use on a non-WooCommerce site:
// a [blockpay_donate amount="25"] shortcode that
// produces a checkout link without touching WC.
use BlockPay\\WooCommerce\\Client;

add_shortcode('blockpay_donate', function ($atts) {
    $atts = shortcode_atts(['amount' => '10'], $atts);
    $bp   = new Client(get_option('blockpay_api_key'));

    $invoice = $bp->createInvoice([
        'amount'          => (string) $atts['amount'],
        'currency'        => 'USDC',
        'chainKey'        => 'base',
        'merchantAddress' => get_option('blockpay_settlement_wallet'),
        'description'     => 'Donation to ' . get_bloginfo('name'),
    ]);

    return sprintf(
        '<a class="blockpay-donate-btn" href="%s">Donate %s USDC</a>',
        esc_url($invoice->checkoutUrl),
        esc_html($atts['amount'])
    );
});`;

const phpVerifyCode = `<?php
// Manual signature verification, no SDK required.
$raw    = file_get_contents('php://input');
$sig    = $_SERVER['HTTP_X_BLOCKPAY_SIGNATURE'] ?? '';
$secret = get_option('blockpay_webhook_secret');

$expected = hash_hmac('sha256', $raw, $secret);
if (!hash_equals($expected, $sig)) {
    http_response_code(401);
    exit('bad signature');
}

$event = json_decode($raw, true);
// dispatch on $event['type']`;

const eventInvoiceCreated = `{
  "type": "invoice.created",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "base",
    "checkoutUrl": "https://blockpay.dev/pay/inv_01HE2...",
    "metadata": { "order_id": "1042" }
  }
}`;

const eventInvoicePaid = `{
  "type": "invoice.paid",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "base",
    "txHash": "0x9b1c...e3f0",
    "settledAt": 1715817600,
    "metadata": { "order_id": "1042" }
  }
}`;

const eventPaymentReceived = `{
  "type": "payment.received",
  "data": {
    "invoiceId": "inv_01HE2...",
    "amount": "49.00",
    "currency": "USDC",
    "chainKey": "base",
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
    "endpoint": "https://example.com/wp-json/my-shop/v1/blockpay-webhook"
  }
}`;

type EventRow = {
  type: string;
  description: string;
  payload: string;
};

const events: EventRow[] = [
  {
    type: "invoice.created",
    description:
      "Fires the moment an invoice is generated for a WooCommerce order. Use the metadata.order_id to wire the BlockPay invoice id back onto the WC order.",
    payload: eventInvoiceCreated,
  },
  {
    type: "invoice.paid",
    description:
      "Fires once the full invoice amount has settled on-chain. Wire it to $order->payment_complete($txHash) to flip the WooCommerce order to processing.",
    payload: eventInvoicePaid,
  },
  {
    type: "payment.received",
    description:
      "Fires for each on-chain transfer attributed to the invoice. Useful for short-pay handling — a single invoice can fire many of these.",
    payload: eventPaymentReceived,
  },
  {
    type: "invoice.expired",
    description:
      "Fires when an invoice passes its TTL without settlement. Cancel the WC order or mark the payment attempt failed.",
    payload: eventInvoiceExpired,
  },
  {
    type: "webhook.test",
    description:
      "Sent from the BlockPay dashboard when you click Send test event. Use it to confirm the endpoint and signature secret before you trust live events.",
    payload: eventWebhookTest,
  },
];

type Section = {
  id: string;
  title: string;
};

const sections: Section[] = [
  { id: "plugin", title: "Plugin" },
  { id: "custom-gateway", title: "Custom gateway" },
  { id: "standalone", title: "Standalone" },
  { id: "events", title: "Webhook events" },
];

export default function WordPressPage() {
  return (
    <PaletteScope>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <Boxes size={12} strokeWidth={2.4} />
              WordPress / WooCommerce
            </span>
            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-accent">WordPress</span> integration.
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted">
              Three paths in. Drop the official plugin into WooCommerce, build
              a custom <InlineCode>WC_Payment_Gateway</InlineCode> on top of
              the SDK, or use the BlockPay PHP client on a non-WooCommerce
              site.
            </p>

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
                id="plugin"
                eyebrow="Option A"
                title="Official WooCommerce plugin"
                subtitle="No code, ~5 minutes from download to a live USDC payment method."
              >
                <p className="text-fg-muted">
                  The official plugin is a standard WooCommerce gateway. You
                  download a zip, upload it through the WordPress admin, and
                  configure four fields. The plugin handles invoice creation,
                  webhook verification and order status transitions for you.
                </p>

                <Subhead>1. Download the plugin</Subhead>
                <p className="mt-3 text-fg-muted">
                  Grab the latest{" "}
                  <InlineCode>blockpay.zip</InlineCode> from{" "}
                  <Link
                    href="/plugins/woocommerce"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    /plugins/woocommerce
                  </Link>
                  . That page lists the current version and a changelog.
                </p>

                <Subhead>2. Upload via WP-admin</Subhead>
                <p className="mt-3 text-fg-muted">
                  In your WordPress admin, go to{" "}
                  <InlineCode>
                    Plugins → Add New → Upload Plugin
                  </InlineCode>
                  , pick the zip, click Install Now, then Activate.
                </p>

                <Subhead>3. Configure four fields</Subhead>
                <p className="mt-3 text-fg-muted">
                  Open{" "}
                  <InlineCode>
                    WooCommerce → Settings → Payments → BlockPay
                  </InlineCode>{" "}
                  and fill in the form. The four fields the plugin asks for:
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {pluginSettings.map((s) => (
                    <SettingCard key={s.name} setting={s} />
                  ))}
                </div>
              </Block>

              <Block
                id="custom-gateway"
                eyebrow="Option B"
                title="Custom WooCommerce gateway"
                subtitle="Build your own gateway on top of blockpay/woocommerce when the stock plugin is not enough."
              >
                <p className="text-fg-muted">
                  When you need bespoke behaviour — different display logic
                  per product type, custom fees, a fork-of-WooCommerce
                  flavour — install the SDK and subclass{" "}
                  <InlineCode>WC_Payment_Gateway</InlineCode> yourself. The
                  SDK ships the API client and a small helpers module that
                  maps a <InlineCode>WC_Order</InlineCode> to the input shape{" "}
                  <InlineCode>createInvoice</InlineCode> expects.
                </p>

                <Subhead>Install</Subhead>
                <CodeBlock code={composerInstall} label="bash" lang="bash" />

                <Subhead>The gateway class</Subhead>
                <p className="mt-3 text-fg-muted">
                  A minimum-viable gateway is about 25 lines. The SDK&apos;s{" "}
                  <InlineCode>WooHelpers::orderToInvoiceInput</InlineCode>{" "}
                  flattens line items, taxes and shipping into the BlockPay
                  invoice schema so you do not have to.
                </p>
                <CodeBlock
                  code={customGatewayCode}
                  label="class-wc-mycustom-blockpay.php"
                  lang="php"
                />

                <Subhead>Webhook handler</Subhead>
                <p className="mt-3 text-fg-muted">
                  Register a single REST route to receive every BlockPay event
                  and dispatch from there. The SDK&apos;s{" "}
                  <InlineCode>Webhooks::verify</InlineCode> uses constant-time
                  HMAC comparison.
                </p>
                <CodeBlock
                  code={webhookHandlerCode}
                  label="blockpay-webhooks.php"
                  lang="php"
                />
              </Block>

              <Block
                id="standalone"
                eyebrow="Option C"
                title="Standalone WordPress"
                subtitle="WooCommerce not in the picture? Use the PHP client directly."
              >
                <p className="text-fg-muted">
                  Plenty of WordPress sites do not run WooCommerce — a
                  donation form, a paywall on a Substack-style blog, a
                  membership site on a different framework. The SDK&apos;s{" "}
                  <InlineCode>Client</InlineCode> talks to the BlockPay API
                  directly without any of the WooCommerce surface.
                </p>

                <Subhead>Install</Subhead>
                <CodeBlock code={composerInstall} label="bash" lang="bash" />

                <Subhead>A donation shortcode</Subhead>
                <p className="mt-3 text-fg-muted">
                  The snippet below registers a{" "}
                  <InlineCode>[blockpay_donate amount=&quot;25&quot;]</InlineCode>{" "}
                  shortcode that mints an invoice on render and outputs an
                  anchor to the hosted checkout. Drop it in any post, page or
                  widget.
                </p>
                <CodeBlock
                  code={standaloneShortcodeCode}
                  label="blockpay-donate.php"
                  lang="php"
                />
              </Block>

              <Block
                id="events"
                eyebrow="Reference"
                title="Webhook events"
                subtitle="Every event BlockPay can send to your WordPress integration."
              >
                <p className="text-fg-muted">
                  Each event arrives as a JSON POST with an{" "}
                  <InlineCode>X-BlockPay-Signature</InlineCode> header. If you
                  are not using the SDK, this is the manual verification
                  pattern:
                </p>
                <CodeBlock code={phpVerifyCode} label="verify.php" lang="php" />

                <div className="mt-10 space-y-10">
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
              <Link href="/docs/shopify" className="btn-pill text-sm">
                Shopify integration
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

function SettingCard({
  setting,
}: {
  setting: { name: string; description: string };
}) {
  return (
    <div className="card-frame-tight px-5 py-4">
      <div className="font-display text-sm font-semibold text-fg">
        {setting.name}
      </div>
      <p className="mt-2 text-sm text-fg-muted">{setting.description}</p>
    </div>
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
            <span className="text-xs text-accent">blockpay/woocommerce</span>
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
