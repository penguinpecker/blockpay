# @blockpay/shopify

Official BlockPay SDK for Shopify themes and apps. Accept USDC and EURC
stablecoin payments on Base, Polygon, Arbitrum, Optimism, and Ethereum
mainnet — without leaving your Shopify storefront.

The SDK exposes three roles:

| Role               | Where it runs | Use it to                                                         |
| ------------------ | ------------- | ----------------------------------------------------------------- |
| `ThemeClient`      | Browser       | Convert a Shopify cart into a BlockPay invoice and redirect       |
| `AppClient`        | Server (Node) | Mirror Shopify orders into BlockPay and capture them on settlement |
| `WebhookBridge`    | Server (Node) | Verify BlockPay webhooks and map them onto Shopify Admin calls    |

Built on top of [`@blockpay/checkout`](https://www.npmjs.com/package/@blockpay/checkout)
(declared as an **optional peer dependency** — the SDK works on its own,
but if you have the base SDK installed it will reuse its audited
crypto primitives).

---

## Install

```bash
npm install @blockpay/shopify
# optional, only needed if you also want the lower-level invoice / link APIs
npm install @blockpay/checkout
```

> The base `@blockpay/checkout` package is declared as an **optional peer
> dependency** in `package.json`. You do not need to install it to use
> this SDK — `WebhookBridge` falls back to a self-contained HMAC
> implementation built on `node:crypto` / WebCrypto.

If you have not published the base SDK yet, swap the peer reference for
a local `file:../checkout-sdk` workspace path during development.

---

## Quick start

```ts
import { BlockPayShopify } from "@blockpay/shopify";

const bp = new BlockPayShopify({
  apiKey: process.env.BLOCKPAY_API_KEY!,
  shopDomain: "demo.myshopify.com",
  webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET,
});

// 1. Server: mirror a Shopify order into a BlockPay invoice
const invoice = await bp.app.syncOrderToInvoice(order);
console.log(invoice.checkoutUrl);

// 2. Server: handle a BlockPay webhook delivery
const result = await bp.webhooks.handle(
  { rawBody, signature: req.headers["x-blockpay-signature"]! },
  {
    onInvoicePaid: async (event) => {
      const orderId = event.data.metadata?.shopify_order_id;
      if (!orderId) return;
      await bp.app.markOrderPaid(orderId, event.data.paymentTxHash!, {
        shopifyAccessToken: process.env.SHOPIFY_ADMIN_TOKEN!,
      });
    },
  },
);
```

---

## Theme integration (no Shopify App required)

The cheapest way to add crypto payments to a Shopify store: drop a
script tag into `theme.liquid`, render a button next to your cart, and
let the SDK convert the cart and redirect.

### Step 1 — expose a publishable BlockPay key as a theme setting

In `config/settings_schema.json`, add an input:

```json
{
  "name": "BlockPay",
  "settings": [
    {
      "type": "text",
      "id": "blockpay_publishable_key",
      "label": "BlockPay publishable key",
      "info": "Find this in your BlockPay dashboard under Developers."
    }
  ]
}
```

### Step 2 — include the SDK in `theme.liquid`

Place the script and config near the bottom of `<body>`:

```liquid
<script defer src="https://unpkg.com/@blockpay/shopify/dist/theme.browser.js"></script>
<script>
  window.__BLOCKPAY_CONFIG__ = {
    apiKey: "{{ settings.blockpay_publishable_key }}",
    shopDomain: "{{ shop.permanent_domain }}",
  };
</script>
```

### Step 3 — drop a button snippet onto the cart page

Create `snippets/blockpay-button.liquid`:

```liquid
<div id="blockpay-cart-button"></div>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.BlockPayShopify || !window.__BLOCKPAY_CONFIG__) return;
    window.BlockPayShopify.mount({
      elementId: "blockpay-cart-button",
      apiKey: window.__BLOCKPAY_CONFIG__.apiKey,
      shopDomain: window.__BLOCKPAY_CONFIG__.shopDomain,
      label: "Pay with USDC",
    });
  });
</script>
```

Then in `sections/main-cart.liquid` (or your cart template), include the
snippet:

```liquid
{% render 'blockpay-button' %}
```

That's it — when a shopper clicks the button, the SDK fetches the
current cart via `/cart.js`, posts an invoice to BlockPay, and redirects
to the BlockPay checkout. After payment, BlockPay redirects back to the
`successUrl` you've configured (or the cart, by default).

#### Pre-rendering the cart from Liquid

If you already have the cart JSON in scope (e.g. from a Liquid
`{{ cart | json }}`), skip the `/cart.js` round-trip:

```liquid
<div id="blockpay-cart-button"></div>
<script>
  var cart = {{ cart | json }};
  window.BlockPayShopify.mountWithCart({
    container: document.getElementById("blockpay-cart-button"),
    cart: cart,
    apiKey: "{{ settings.blockpay_publishable_key }}",
    shopDomain: "{{ shop.permanent_domain }}",
  });
</script>
```

---

## App integration (Shopify Partners — Remix or Next.js)

Use `AppClient` from your server-side code. The constructor takes your
**secret** BlockPay key, so never bundle it into a Shopify theme.

### Remix example

```ts
// app/lib/blockpay.server.ts
import { BlockPayShopify } from "@blockpay/shopify";

export function getBlockPay(shopDomain: string) {
  return new BlockPayShopify({
    apiKey: process.env.BLOCKPAY_API_KEY!,
    shopDomain,
    webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET,
  });
}
```

```ts
// app/routes/api.create-invoice.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getBlockPay } from "~/lib/blockpay.server";
import { authenticate } from "~/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const { order_id } = await request.json();

  // Fetch the order via Shopify GraphQL
  const response = await admin.graphql(
    `#graphql
      query Order($id: ID!) {
        order(id: $id) {
          id
          name
          currencyCode
          totalPriceSet { presentmentMoney { amount } }
          email
          lineItems(first: 50) {
            nodes { id title quantity variantTitle originalUnitPriceSet { presentmentMoney { amount } } }
          }
        }
      }
    `,
    { variables: { id: `gid://shopify/Order/${order_id}` } },
  );
  const body = await response.json();
  const node = body.data.order;

  const bp = getBlockPay(session.shop);
  const invoice = await bp.app.syncOrderToInvoice({
    id: node.id.split("/").pop()!,
    name: node.name,
    currency: node.currencyCode,
    total_price: node.totalPriceSet.presentmentMoney.amount,
    email: node.email,
    line_items: node.lineItems.nodes.map((n: any) => ({
      id: n.id,
      title: n.title,
      quantity: n.quantity,
      variant_title: n.variantTitle,
      price: n.originalUnitPriceSet.presentmentMoney.amount,
    })),
  });

  return json({ checkoutUrl: invoice.checkoutUrl });
}
```

### Next.js (App Router) example

```ts
// app/api/create-invoice/route.ts
import { NextResponse } from "next/server";
import { BlockPayShopify } from "@blockpay/shopify";

export async function POST(req: Request) {
  const order = await req.json();
  const bp = new BlockPayShopify({
    apiKey: process.env.BLOCKPAY_API_KEY!,
    shopDomain: order.shop_domain,
  });
  const invoice = await bp.app.syncOrderToInvoice(order);
  return NextResponse.json({ checkoutUrl: invoice.checkoutUrl });
}
```

---

## Webhook bridge

BlockPay signs every outgoing webhook with the per-endpoint secret
shown in your dashboard. The SDK verifies the signature, parses the
event, and routes it at the appropriate Shopify Admin action.

### Remix route

```ts
// app/routes/webhooks.blockpay.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { BlockPayShopify } from "@blockpay/shopify";

export async function action({ request }: ActionFunctionArgs) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-blockpay-signature") ?? "";

  const bp = new BlockPayShopify({
    apiKey: process.env.BLOCKPAY_API_KEY!,
    shopDomain: "placeholder.myshopify.com",
    webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET,
  });

  const result = await bp.webhooks.handle(
    { rawBody, signature },
    {
      onInvoicePaid: async (event) => {
        const orderId = event.data.metadata?.shopify_order_id;
        const shopDomain = event.data.metadata?.shop_domain;
        if (!orderId || !shopDomain) return;

        // Look up the shop's offline access token from your DB
        const accessToken = await loadShopifyAccessToken(shopDomain);
        const shopBp = new BlockPayShopify({
          apiKey: process.env.BLOCKPAY_API_KEY!,
          shopDomain,
        });
        await shopBp.app.markOrderPaid(orderId, event.data.paymentTxHash!, {
          shopifyAccessToken: accessToken,
          amount: event.data.amount,
          currency: "USD",
        });
      },
    },
  );

  if (!result.verified) {
    return json({ error: "invalid signature" }, { status: 401 });
  }
  return json({ ok: true });
}

async function loadShopifyAccessToken(_shopDomain: string): Promise<string> {
  // Replace with your real session/store lookup.
  return process.env.SHOPIFY_ADMIN_TOKEN!;
}
```

### Next.js (App Router) route

```ts
// app/api/webhooks/blockpay/route.ts
import { NextResponse } from "next/server";
import { BlockPayShopify } from "@blockpay/shopify";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-blockpay-signature") ?? "";

  const bp = new BlockPayShopify({
    apiKey: process.env.BLOCKPAY_API_KEY!,
    shopDomain: "placeholder.myshopify.com",
    webhookSecret: process.env.BLOCKPAY_WEBHOOK_SECRET,
  });

  const { verified } = await bp.webhooks.handle(
    { rawBody, signature },
    {
      onInvoicePaid: async (event) => {
        // ...same as above
        void event;
      },
    },
  );

  if (!verified) return new NextResponse("invalid", { status: 401 });
  return NextResponse.json({ ok: true });
}
```

### Signature format

BlockPay sends a Stripe-style header:

```
X-Blockpay-Signature: t=1700000000,v1=<hex hmac>
```

The HMAC is `HMAC-SHA256(secret, "{t}.{rawBody}")`. The bridge also
accepts plain `sha256=<hex>` headers as a fallback for older endpoints.
A 5-minute clock-skew tolerance is enforced by default; override via
`toleranceSeconds`.

---

## API reference

### `new BlockPayShopify(options)`

| Option           | Type        | Required | Description                                   |
| ---------------- | ----------- | -------- | --------------------------------------------- |
| `apiKey`         | `string`    | yes      | BlockPay API key                              |
| `shopDomain`     | `string`    | yes      | `<your-shop>.myshopify.com`                   |
| `webhookSecret`  | `string`    | no       | Per-endpoint webhook signing secret           |
| `baseUrl`        | `string`    | no       | Override the BlockPay API host                |
| `fetch`          | `function`  | no       | Custom fetch implementation (handy for tests) |

### `bp.theme.cartToInvoice(cart, conversion?)`

Converts a Shopify `/cart.js` cart into a BlockPay invoice and returns
`{ invoiceId, checkoutUrl, invoice }`.

### `bp.theme.renderPayButton(opts)`

Renders a styled button into `opts.container` that, when clicked,
creates the invoice and redirects.

### `bp.app.syncOrderToInvoice(order, conversion?)`

Server-side conversion of a Shopify Admin Order to a BlockPay invoice.
The resulting invoice's metadata always carries `shopify_order_id` so
the webhook bridge can map back.

### `bp.app.markOrderPaid(orderId, txHash, { shopifyAccessToken, ... })`

Records a `kind: "capture"` transaction against the Shopify order. The
access token must carry `write_orders` scope.

### `bp.webhooks.verify({ rawBody, signature, secret?, ... })`

Returns `true` on a valid signature. Never throws — returns `false`
for every failure mode (bad signature, stale timestamp, missing
fields).

### `bp.webhooks.routeEvent(event, handlers)`

Dispatches a parsed event to the matching handler:

- `onInvoicePaid`
- `onInvoiceExpired`
- `onInvoiceCancelled`
- `onPaymentReceived`
- `onPaymentLinkUsed`
- `onOther` (catch-all)

### `bp.webhooks.handle(input, handlers)`

Verifies, parses, and routes in one call. Returns
`{ verified, routed }`.

---

## Local development

```bash
cd packages/shopify-sdk
npm install --legacy-peer-deps
npm run typecheck
npm run build
npm test
```

---

## License

MIT — see [LICENSE](./LICENSE).
