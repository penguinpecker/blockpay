# BlockPay for Shopify

A Shopify App that lets merchants accept on-chain USDC payments from their
Shopify storefront. Built on the official Shopify Remix app template.

This is the **v0 integration**: shoppers click a "Pay with crypto via BlockPay"
button on the cart page and are redirected to BlockPay-hosted checkout, where
the merchant's USDC settlement happens against a wallet they own. A native
Shopify Payments App API integration is the v1 follow-up (see the
[Production submission roadmap](#production-submission-roadmap) below).

## What's in this directory

```
integrations/shopify/
  app/                                # Remix app (admin UI + OAuth + webhooks)
    routes/
      _index/                         # Marketing splash + log-in form
      auth.$.tsx                      # Catch-all OAuth handler
      auth.login/                     # Shop-domain login form
      app.tsx                         # Embedded admin shell (Polaris + App Bridge)
      app._index.tsx                  # Dashboard: settlement address + chain
      api.settings.ts                 # POST /api/settings — persists merchant config
      webhooks.app.uninstalled.tsx    # Cleanup on uninstall
      webhooks.app.scopes_update.tsx  # Sync scope changes
      healthcheck.tsx                 # GET /healthcheck
    db.server.ts                      # Prisma client singleton
    shopify.server.ts                 # @shopify/shopify-app-remix bootstrap
    entry.server.tsx                  # SSR entry
    root.tsx                          # Root HTML document
    routes.ts                         # Flat routes config
  extensions/
    blockpay-checkout/                # Theme App Extension
      blocks/checkout-cta.liquid      # Pay-with-crypto button block
      assets/checkout-cta.css
      locales/en.default.json
      shopify.extension.toml
  prisma/schema.prisma                # Session + MerchantSettings models
  shopify.app.toml                    # App config (scopes, URLs, webhooks)
  vite.config.ts
  tsconfig.json
  package.json
  .env.example
  LICENSE                             # MIT
  README.md
```

## Prerequisites

- Node.js `^18.20`, `^20.10`, or `>=21.0.0`
- A Shopify Partner account: <https://partners.shopify.com/>
- A development store created from your Partner dashboard
- npm 10+ (yarn or pnpm also fine)

## Setup

```bash
# 1. From the repo root, jump into the Shopify app
cd integrations/shopify

# 2. Install dependencies
npm install

# 3. Copy the env template
cp .env.example .env

# 4. Generate the Prisma client and run the first local migration
npx prisma migrate dev --name init

# 5. Link this app to a Shopify Partner app
#    (creates a Client ID, populates shopify.app.toml automatically)
npx shopify app config link
```

When `shopify app config link` prompts, either select an existing Partner app
or create a new one. The CLI writes the resulting `client_id` and
`application_url` back into `shopify.app.toml`.

## Run locally

```bash
npm run dev
```

This invokes `shopify app dev`, which:

1. Tunnels your local server to a public HTTPS URL.
2. Opens the Shopify Partner admin so you can install the app on your dev store.
3. Hot-reloads the Remix admin UI and the theme extension as you edit.

Once installed, navigate to the embedded app. You will see:

- A banner: **BlockPay is in testnet — connect your settlement wallet to start accepting USDC.**
- An input for **Settlement wallet address** (`0x…`)
- A select for **Settlement chain** (Arc Testnet, Base Sepolia)
- A **Save settings** button (POSTs to `/api/settings`)

Click **Preview hosted checkout** to open the BlockPay payment link in a new
tab — it points at `https://blockpay-six.vercel.app/pay/<slug>?source=shopify&shop=<domain>`.

## Install the theme extension

After `npm run dev` is running:

1. In the Shopify admin, go to **Online Store > Themes**.
2. Click **Customize** on your current theme.
3. Open the **Cart** template (or any section).
4. Click **Add block** > **Apps** > **BlockPay checkout CTA**.
5. Configure the button label and helper text in the block sidebar.
6. **Save**.

Shoppers will now see a "Pay with crypto via BlockPay" button on the cart
page. Clicking it redirects them to the BlockPay-hosted checkout, carrying
`shop`, `source=shopify`, `cart_total`, and `currency` query params so
BlockPay can resolve the merchant and render the right amount.

## Configuration reference

### `shopify.app.toml`

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| `name`            | `BlockPay`                           |
| `application_url` | `https://blockpay-six.vercel.app`    |
| `scopes`          | `read_products,write_orders`         |
| `embedded`        | `true`                               |

The `application_url` is a placeholder. When the reviewer's tunnel comes up,
`shopify app dev` updates it automatically (the `automatically_update_urls_on_dev`
flag is on).

### Environment variables

See `.env.example`. The required ones are:

- `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` — provisioned by the Shopify CLI.
- `SCOPES` — must match `shopify.app.toml`.
- `HOST` / `SHOPIFY_APP_URL` — your tunnel URL during dev.
- `BLOCKPAY_APP_URL` — where the hosted checkout lives. Defaults to production.
- `DATABASE_URL` — Prisma connection string. Defaults to SQLite at `prisma/dev.sqlite`.

## Production submission roadmap

The v0 integration in this repo is good enough for merchants to install on
their store today via a custom-app or unlisted distribution. To get listed
on the Shopify App Store and to process Shopify checkout payments natively,
the following work is still required:

1. **Payments App API approval.** Shopify gates native payment processing
   behind a manual review by the Payments team. Apply at
   <https://shopify.dev/docs/apps/build/payments>. Approval timelines have
   historically been multiple weeks.
2. **Implement the Payments App contract.** Once approved, replace the
   redirect-style theme extension with a Payments App that handles:
   - `payment` session create / refund / capture / void
   - `payment_session.resolve` / `payment_session.reject`
   - Settlement reconciliation back to the merchant's wallet
3. **App Store listing assets.** Screenshots, demo video, app icon, a
   privacy policy URL, a support email, and pricing details.
4. **Mandatory webhooks.** GDPR data subject request handlers
   (`customers/data_request`, `customers/redact`, `shop/redact`) must be
   implemented and respond within 30 days.
5. **Compliance review.** Shopify reviews scopes, data handling, and the
   shopper experience. Keep scopes minimal — this repo already does
   (`read_products,write_orders` only).
6. **Mainnet chain support.** Today the dashboard only exposes Arc Testnet
   and Base Sepolia. Add the mainnet equivalents once BlockPay's on-chain
   settlement contracts are audited and deployed.

## Testing

- Run `npm run lint` to lint TypeScript.
- Run `npm run build` to verify the Remix build compiles.
- Manual smoke test: `npm run dev`, install on a dev store, save settings,
  add the theme block, click the storefront button, confirm it redirects to
  `blockpay-six.vercel.app/pay/<slug>?...`.

## License

[MIT](./LICENSE).
