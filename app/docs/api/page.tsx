import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export const metadata = {
  title: "REST API reference — BlockPay docs",
  description:
    "Reference for the BlockPay REST API: invoices, payments, and Circle webhook ingestion. Every endpoint with request and response shapes.",
};

const createInvoiceRequest = `POST /api/invoices
Content-Type: application/json

{
  "merchantId": "merchant_acme",
  "merchantAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "4900000",
  "currency": "USDC",
  "chainKey": "base",
  "lineItems": [
    { "label": "Pro Plan", "amount": "4900000" }
  ],
  "expiresAt": 1747353600
}`;

const createInvoiceResponse = `HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "inv_01HE2K6BX9C0",
  "onChainInvoiceId": "0x9b1c...e3f0",
  "checkoutUrl": "/checkout/inv_01HE2K6BX9C0",
  "invoice": {
    "id": "inv_01HE2K6BX9C0",
    "merchantId": "merchant_acme",
    "merchantAddress": "0xA0b8...eB48",
    "amount": "4900000",
    "currency": "USDC",
    "chainKey": "base",
    "status": "open",
    "lineItems": [{ "label": "Pro Plan", "amount": "4900000" }],
    "createdAt": 1747350000,
    "expiresAt": 1747353600
  }
}`;

const getInvoiceRequest = `GET /api/invoices/inv_01HE2K6BX9C0`;

const getInvoiceResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "invoice": {
    "id": "inv_01HE2K6BX9C0",
    "merchantId": "merchant_acme",
    "merchantAddress": "0xA0b8...eB48",
    "amount": "4900000",
    "currency": "USDC",
    "chainKey": "base",
    "status": "paid",
    "settledTxHash": "0x4f1c...92a0",
    "settledAt": 1747350522
  }
}`;

const listInvoicesRequest = `GET /api/invoices?merchantId=merchant_acme&status=open`;

const listInvoicesResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "invoices": [
    { "id": "inv_01HE2K6BX9C0", "status": "open",  "amount": "4900000" },
    { "id": "inv_01HE2K6BXAA", "status": "open",  "amount": "1200000" }
  ]
}`;

const listPaymentsRequest = `GET /api/payments?merchantId=merchant_acme&chainKey=base`;

const listPaymentsResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "payments": [
    {
      "id": "pay_01HE2K7Z11",
      "invoiceId": "inv_01HE2K6BX9C0",
      "chainKey": "base",
      "txHash": "0x4f1c...92a0",
      "amount": "4900000",
      "currency": "USDC",
      "from": "0xCustomer...",
      "to":   "0xA0b8...eB48",
      "blockNumber": 21893444,
      "confirmedAt": 1747350522
    }
  ]
}`;

const circleWebhookRequest = `POST /api/webhooks/circle
Content-Type: application/json
X-Circle-Signature: t=1747350500,v1=<hex hmac sha256>

{
  "type": "transfers.created",
  "data": {
    "id": "ct_01HE2K7Z11",
    "amount": { "amount": "49.00", "currency": "USD" },
    "destination": {
      "type": "blockchain",
      "address": "0xA0b8...eB48",
      "chain": "BASE"
    }
  }
}`;

const circleWebhookResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{ "ok": true }`;

type EndpointDef = {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  request: string;
  response: string;
  errors: { code: string; meaning: string }[];
};

const endpoints: EndpointDef[] = [
  {
    id: "post-invoices",
    method: "POST",
    path: "/api/invoices",
    title: "Create an invoice",
    description:
      "Creates a fresh open invoice. Returns the canonical id, the on-chain commitment id and a checkout URL you can redirect the customer to.",
    request: createInvoiceRequest,
    response: createInvoiceResponse,
    errors: [
      { code: "400 invalid_json", meaning: "Body could not be parsed as JSON." },
      { code: "400 invalid_field", meaning: "A required field was missing or malformed. The response includes the failing field name." },
    ],
  },
  {
    id: "get-invoice",
    method: "GET",
    path: "/api/invoices/{id}",
    title: "Fetch a single invoice",
    description:
      "Returns the latest known state of one invoice, including settlement information once the on-chain transfer has confirmed.",
    request: getInvoiceRequest,
    response: getInvoiceResponse,
    errors: [
      { code: "404 not_found", meaning: "No invoice exists with that id." },
    ],
  },
  {
    id: "list-invoices",
    method: "GET",
    path: "/api/invoices",
    title: "List invoices",
    description:
      "Lists invoices, optionally filtered. Supports merchantId and status query parameters. Both are independent — pass either, both, or neither.",
    request: listInvoicesRequest,
    response: listInvoicesResponse,
    errors: [
      { code: "400 invalid_status", meaning: "status must be one of draft, open, paid, expired, void." },
    ],
  },
  {
    id: "list-payments",
    method: "GET",
    path: "/api/payments",
    title: "List on-chain payments",
    description:
      "Lists payments recorded by the BlockPay indexer. Filter by merchantId, chainKey, or both. Useful for reconciliation against your own ledger.",
    request: listPaymentsRequest,
    response: listPaymentsResponse,
    errors: [
      { code: "400 invalid_chain", meaning: "chainKey is not a known chain." },
    ],
  },
  {
    id: "post-webhooks-circle",
    method: "POST",
    path: "/api/webhooks/circle",
    title: "Circle webhook ingestion",
    description:
      "Inbound endpoint for Circle's transfer webhooks. The request is HMAC-verified against the shared Circle webhook secret; invalid signatures are rejected with 401. You do not call this endpoint — Circle does.",
    request: circleWebhookRequest,
    response: circleWebhookResponse,
    errors: [
      { code: "401 invalid_signature", meaning: "HMAC signature did not match." },
      { code: "400 invalid_payload", meaning: "Body could not be parsed or required Circle fields were missing." },
    ],
  },
];

export default function ApiPage() {
  return (
    <PaletteScope>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              REST API
            </span>
            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              The <span className="text-accent">BlockPay</span> REST API.
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted">
              All requests are JSON over HTTPS. Amounts are integer-string
              minor units (USDC has 6 decimals, so 4900000 is $4.90). Times
              are Unix seconds.
            </p>

            <nav className="mt-12 flex flex-wrap gap-2 text-sm">
              {endpoints.map((e) => (
                <a key={e.id} href={`#${e.id}`} className="btn-pill">
                  <MethodTag method={e.method} compact />
                  <span className="font-mono text-xs">{e.path}</span>
                </a>
              ))}
            </nav>

            <div className="mt-20 space-y-20">
              {endpoints.map((e) => (
                <Endpoint key={e.id} ep={e} />
              ))}
            </div>

            <div className="mt-20 flex flex-wrap gap-3">
              <Link href="/docs/sdk" className="btn-pill text-sm">
                JavaScript SDK
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/docs/webhooks" className="btn-pill text-sm">
                Outgoing webhooks
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

function Endpoint({ ep }: { ep: EndpointDef }) {
  return (
    <section id={ep.id} className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-3">
        <MethodTag method={ep.method} />
        <code className="font-mono text-base text-fg">{ep.path}</code>
      </div>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
        {ep.title}
      </h2>
      <p className="mt-4 max-w-2xl text-fg-muted">{ep.description}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            Request
          </h3>
          <CodeBlock code={ep.request} />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            Response
          </h3>
          <CodeBlock code={ep.response} />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-fg-subtle">
          Error codes
        </h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elev)]">
                <th className="px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                  Code
                </th>
                <th className="px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {ep.errors.map((er) => (
                <tr
                  key={er.code}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-5 py-3 font-mono text-[13px] text-accent">
                    {er.code}
                  </td>
                  <td className="px-5 py-3 text-fg-muted">{er.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MethodTag({
  method,
  compact = false,
}: {
  method: "GET" | "POST";
  compact?: boolean;
}) {
  const palette =
    method === "POST"
      ? "border-[var(--border-active)] bg-[var(--bg-elev)] text-accent"
      : "border-[var(--border-strong)] bg-[var(--bg-elev)] text-[#a5f3fc]";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono font-semibold tracking-wider ${palette} ${
        compact ? "text-[10px]" : "text-xs"
      }`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
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
