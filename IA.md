# BlockPay Information Architecture

## Marketing site (public)
- `/` Home — already built
- `/features` — Feature deep-dives (gasless, cross-chain, accept-any-token, receipts, subscriptions, splits)
- `/solutions` — Vertical pitches (Shopify, WooCommerce, Marketplaces, SaaS subscriptions, In-person POS)
- `/pricing` — Tiered pricing (Free, Growth, Scale) + fee table
- `/contact` — Form + sales info
- `/docs` — Developer docs (Quick start, API reference, SDK, Webhooks, Plugins)
- `/blog` — Articles index (stub)
- `/about`, `/careers`, `/terms`, `/privacy` — Legal & company (stubs)
- `/signup`, `/login` — Auth (stubs)

## Merchant dashboard `/dashboard`
Authenticated merchant area, sidebar nav, dark themed to match brand.

- `/dashboard` — Overview (volume, revenue, recent payments, payouts pending)
- `/dashboard/payments` — Payments list, filters, detail drawer
- `/dashboard/invoices` — Invoice list, create invoice, send via email
- `/dashboard/links` — Payment links (one-off and reusable), QR codes
- `/dashboard/subscriptions` — Recurring billing list, plans, customer assignments
- `/dashboard/customers` — Customer ledger, lifetime value, contact info
- `/dashboard/payouts` — Settlement history, wallet balances per chain
- `/dashboard/refunds` — Issued refunds, dispute log
- `/dashboard/integrations` — Connect Shopify, WooCommerce, Webhooks, API keys
- `/dashboard/team` — Members, roles
- `/dashboard/settings` — Account, brand, settlement chain & currency, tax

## User app `/app`
Consumer-side wallet / payment companion.

- `/app` — Wallet overview (USDC + multi-chain balances)
- `/app/send` — Send USDC to an address or phonebook contact
- `/app/receive` — Receive (QR + handle)
- `/app/requests` — Payment requests sent / received
- `/app/contacts` — Phonebook (ENS / SNS / email aliases)
- `/app/activity` — Transaction history with rendered receipts
- `/app/settings` — Account, security, notifications

## Checkout widget `/checkout/[invoiceId]`
Embedded payment surface used by merchant integrations.

- `/checkout/[id]` — Render line items, choose token, choose chain, connect wallet, pay gaslessly
- `/checkout/[id]/success` — Receipt screen with on-chain proof
- `/embed/preview` — Standalone preview used in marketing demo

## Component shared library
- `Logo`, `Nav`, `Footer`
- Section primitives: `CardFrame`, `BtnPill`, `BtnPillSolid`
- Illustration set (already built)
- Shared dashboard chrome: `SidebarNav`, `TopBar`, `PageHeader`, `StatCard`, `DataTable`
