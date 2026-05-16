# @blockpay/checkout

Official JavaScript / TypeScript SDK for [BlockPay](https://blockpay-six.vercel.app) — accept USDC and EURC stablecoin payments on Base, Ethereum, Polygon, Arbitrum, and Optimism with a single API.

- Typed end-to-end (TypeScript first, plain JS welcome)
- Works in Node 18+, Bun, Deno, Cloudflare Workers, and browsers
- Server-side: invoices, payment links, webhook verification, EIP-712 receipts
- Browser drop-in: embed the BlockPay checkout iframe in any page
- ESM + CJS dual build, tree-shakeable subpath exports

## Installation

```bash
npm install @blockpay/checkout
# or
pnpm add @blockpay/checkout
# or
yarn add @blockpay/checkout
```

The SDK has a single runtime dependency on [`viem`](https://viem.sh) for EIP-712 signature verification. If your project already uses viem, it will be deduped automatically.

## Quickstart

Create an invoice from your server:

```ts
import BlockPay from "@blockpay/checkout";

const bp = new BlockPay({
  apiKey: process.env.BLOCKPAY_API_KEY!,
});

const invoice = await bp.invoices.create({
  label: "Pro plan – monthly",
  amount: "29.00",
  currency: "USDC",
  chainKey: "base",
  description: "Unlimited seats, audit log, priority support",
  successUrl: "https://example.com/thanks",
  cancelUrl: "https://example.com/pricing",
});

console.log(invoice.checkoutUrl);
// → https://blockpay-six.vercel.app/checkout/inv_01HX...
```

Redirect the customer to `invoice.checkoutUrl` and BlockPay handles the wallet flow, on-chain settlement, and receipt issuance.

## Concepts

| Resource       | What it is                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Invoice        | A one-time charge tied to a specific amount, chain, and (optionally) buyer |
| Payment link   | A reusable URL that collects the same amount from many payers              |
| Webhook        | A signed JSON delivery sent to your endpoint on lifecycle events           |
| Signed receipt | An EIP-712 record of a paid invoice, verifiable off-chain                  |

## API reference

### `new BlockPay(options)`

| Option    | Type                     | Required | Default                              |
| --------- | ------------------------ | -------- | ------------------------------------ |
| `apiKey`  | `string`                 | yes      | —                                    |
| `baseUrl` | `string`                 | no       | `https://blockpay-six.vercel.app`    |
| `fetch`   | `typeof fetch`           | no       | `globalThis.fetch`                   |
| `headers` | `Record<string, string>` | no       | `{}`                                 |

### `bp.invoices`

```ts
bp.invoices.create(input: CreateInvoiceInput): Promise<Invoice>
bp.invoices.get(id: string): Promise<Invoice>
bp.invoices.list(filter?: ListInvoicesFilter): Promise<Invoice[]>
bp.invoices.cancel(id: string): Promise<Invoice>
```

`CreateInvoiceInput`:

```ts
{
  label: string;
  amount: string;          // decimal, e.g. "29.00"
  currency: "USDC" | "EURC";
  chainKey: "ethereum" | "base" | "base-sepolia" | "polygon" | "arbitrum" | "optimism";
  description?: string;
  lineItems?: { description: string; unitAmount: string; quantity: number }[];
  metadata?: Record<string, string>;
  expiresAt?: string;      // ISO-8601
  successUrl?: string;
  cancelUrl?: string;
}
```

### `bp.paymentLinks`

```ts
bp.paymentLinks.create(input: CreatePaymentLinkInput): Promise<PaymentLink>
bp.paymentLinks.get(id: string): Promise<PaymentLink>
bp.paymentLinks.list(): Promise<PaymentLink[]>
bp.paymentLinks.archive(id: string): Promise<void>
```

### `bp.webhooks`

Verify a webhook delivery in your handler:

```ts
import { headers } from "next/headers";
import BlockPay from "@blockpay/checkout";

const bp = new BlockPay({ apiKey: process.env.BLOCKPAY_API_KEY! });

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = (await headers()).get("x-blockpay-signature") ?? "";

  const event = await bp.webhooks.parse({
    rawBody,
    signature,
    secret: process.env.BLOCKPAY_WEBHOOK_SECRET!,
  });

  switch (event.event) {
    case "invoice.paid":
      // fulfil the order
      break;
    case "invoice.expired":
      // notify the customer
      break;
  }

  return new Response("ok");
}
```

`webhooks.verify()` uses `node:crypto` when available and falls back to `crypto.subtle` so it works on Cloudflare Workers and Vercel Edge.

### `bp.receipts`

Cryptographically verify a signed receipt you received off-band:

```ts
const ok = await bp.receipts.verify({
  receipt: signedReceipt,
  expectedMerchant: "0xAbC...",
});
if (!ok) throw new Error("receipt is not authentic");
```

The signer recovered from the EIP-712 signature must equal `expectedMerchant` for `verify()` to return `true`.

### Errors

Every SDK call throws a `BlockPayError` on failure:

```ts
import { BlockPayError } from "@blockpay/checkout";

try {
  await bp.invoices.get("missing");
} catch (err) {
  if (err instanceof BlockPayError) {
    console.error(err.code, err.status, err.message);
  } else {
    throw err;
  }
}
```

| Field     | Type      | Notes                                                  |
| --------- | --------- | ------------------------------------------------------ |
| `code`    | `string`  | Machine-readable identifier (e.g. `invoice_not_found`) |
| `message` | `string`  | Human-readable summary                                 |
| `status`  | `number`  | HTTP status. `0` if the request never reached the API  |
| `details` | `unknown` | Structured details from the API                        |

## Browser widget

Drop the iframe widget into any page:

```html
<div id="bp-checkout"></div>
<script type="module">
  import { mount } from "https://unpkg.com/@blockpay/checkout/checkout";

  mount({
    elementId: "bp-checkout",
    invoiceId: "inv_01HX...",
    onSuccess: (receipt) => {
      console.log("paid", receipt);
    },
    onCancel: () => console.log("cancelled"),
    onError: (err) => console.error(err),
  });
</script>
```

`mount()` returns `{ iframe, destroy }`. Call `destroy()` when your component unmounts to remove the iframe and message listener.

## Subpath exports

Import only what you need:

```ts
import { InvoicesModule } from "@blockpay/checkout/invoices";
import { WebhooksModule } from "@blockpay/checkout/webhooks";
import { mount } from "@blockpay/checkout/checkout";
```

## Local development

```bash
npm install
npm run build      # tsup → dist/
npm run typecheck  # tsc --noEmit
npm test           # vitest
```

## License

MIT
