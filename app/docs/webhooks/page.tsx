import Link from "next/link";
import { ChevronRight, Webhook } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

export const metadata = {
  title: "Webhooks — BlockPay docs",
  description:
    "How BlockPay delivers signed webhook events to your endpoint, the event types, and how to verify the HMAC signature in Node.",
};

const sampleEvent = `POST https://your-app.example/blockpay/webhook
Content-Type: application/json
X-BlockPay-Event: invoice.paid
X-BlockPay-Delivery: del_01HE2K9F8M
X-BlockPay-Timestamp: 1747350522
X-BlockPay-Signature: t=1747350522,v1=8d2c4f...

{
  "id": "evt_01HE2K9F8M",
  "type": "invoice.paid",
  "createdAt": 1747350522,
  "data": {
    "invoice": {
      "id": "inv_01HE2K6BX9C0",
      "merchantId": "merchant_acme",
      "amount": "4900000",
      "currency": "USDC",
      "chainKey": "arc-testnet",
      "status": "paid",
      "settledTxHash": "0x4f1c...92a0",
      "settledAt": 1747350522
    }
  }
}`;

const verifyNode = `import crypto from "node:crypto";

const WEBHOOK_SECRET = process.env.BLOCKPAY_WEBHOOK_SECRET!;
const TOLERANCE_SECONDS = 5 * 60;

export function verifyBlockPaySignature(opts: {
  rawBody: string;
  header: string | null;
}): { ok: true } | { ok: false; reason: string } {
  if (!opts.header) return { ok: false, reason: "missing_header" };

  // header looks like: "t=1747350522,v1=8d2c4f..."
  const parts = Object.fromEntries(
    opts.header.split(",").map((p) => p.split("=", 2) as [string, string]),
  );
  const ts = Number(parts.t);
  const sig = parts.v1;
  if (!Number.isFinite(ts) || typeof sig !== "string") {
    return { ok: false, reason: "malformed_header" };
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - ts;
  if (Math.abs(ageSeconds) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const signedPayload = \`\${ts}.\${opts.rawBody}\`;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  return { ok: true };
}`;

const routeExample = `import { verifyBlockPaySignature } from "./verify";

export async function POST(req: Request) {
  // IMPORTANT: read the raw body, not parsed JSON. Re-serialised
  // JSON will not match the signature.
  const raw = await req.text();

  const result = verifyBlockPaySignature({
    rawBody: raw,
    header: req.headers.get("x-blockpay-signature"),
  });

  if (!result.ok) {
    return new Response("invalid signature", { status: 401 });
  }

  const event = JSON.parse(raw) as { type: string; data: unknown };

  switch (event.type) {
    case "invoice.paid":
      // fulfill the order, send the receipt email, etc.
      break;
    case "payment.refunded":
      // mark the order refunded
      break;
  }

  // Return 2xx within 5 seconds. BlockPay retries with backoff for
  // up to 24 hours on anything other than 2xx.
  return new Response("ok");
}`;

type EventDef = {
  name: string;
  description: string;
};

const events: EventDef[] = [
  {
    name: "invoice.created",
    description:
      "A new invoice has been created. The customer has not yet paid; the invoice is in open state.",
  },
  {
    name: "invoice.paid",
    description:
      "An on-chain transfer satisfying the invoice has confirmed. Fulfil the order.",
  },
  {
    name: "invoice.expired",
    description:
      "The invoice passed its expiresAt without being paid. The on-chain commitment is closed.",
  },
  {
    name: "payment.received",
    description:
      "An on-chain transfer was observed at one of your settlement addresses, attributed to a BlockPay invoice.",
  },
  {
    name: "payment.refunded",
    description:
      "A refund transfer initiated from your settlement wallet has confirmed back to the original payer.",
  },
];

export default function WebhooksDocsPage() {
  return (
    <PaletteScope>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <Webhook size={12} strokeWidth={2.4} />
              Webhooks
            </span>
            <h1
              className="mt-6 font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Receive <span className="text-accent">signed events</span> when
              payments land.
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted">
              BlockPay posts every state change to your endpoint as a signed
              JSON event. Verify the HMAC signature, then trust the payload.
            </p>

            <nav className="mt-12 flex flex-wrap gap-2 text-sm">
              <a href="#overview" className="btn-pill">
                Overview
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#payload" className="btn-pill">
                Example payload
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#verify" className="btn-pill">
                Verify the signature
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#events" className="btn-pill">
                Event types
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
              <a href="#retries" className="btn-pill">
                Retries
                <ChevronRight size={14} strokeWidth={2.4} />
              </a>
            </nav>

            <section id="overview" className="mt-20 scroll-mt-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Overview
              </h2>
              <p className="mt-4 max-w-2xl text-fg-muted">
                Configure a webhook URL per merchant in the BlockPay
                dashboard. Every event hits that URL as an HTTP POST with a
                JSON body and a signature header. Respond with any 2xx within
                five seconds. BlockPay retries on non-2xx responses with
                exponential backoff for up to 24 hours.
              </p>
            </section>

            <section id="payload" className="mt-16 scroll-mt-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Example payload
              </h2>
              <p className="mt-4 max-w-2xl text-fg-muted">
                A typical <InlineCode>invoice.paid</InlineCode> event. Note
                the <InlineCode>X-BlockPay-Signature</InlineCode> header
                contains a timestamp and a v1 HMAC over{" "}
                <InlineCode>{`${"`${timestamp}.${rawBody}`"}`}</InlineCode>.
              </p>
              <CodeBlock code={sampleEvent} label="HTTP" />
            </section>

            <section id="verify" className="mt-16 scroll-mt-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
                Verify the signature
              </h2>
              <p className="mt-4 max-w-2xl text-fg-muted">
                Always verify before doing anything with the payload. Use the
                raw request body — re-serialised JSON will not match. Use
                Node&apos;s <InlineCode>crypto.timingSafeEqual</InlineCode> to
                compare digests; never use a plain{" "}
                <InlineCode>===</InlineCode>.
              </p>
              <CodeBlock code={verifyNode} label="verify.ts" />

              <h3 className="mt-12 font-display text-xl font-semibold text-fg">
                Wire it into your route
              </h3>
              <CodeBlock code={routeExample} label="route.ts" />
            </section>

            <section id="events" className="mt-16 scroll-mt-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Event types
              </h2>
              <p className="mt-4 max-w-2xl text-fg-muted">
                Five event types cover the full lifecycle. All events share
                the same envelope; only the <InlineCode>data</InlineCode>{" "}
                shape changes per type.
              </p>

              <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-elev)]">
                      <th className="px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                        Event
                      </th>
                      <th className="px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr
                        key={e.name}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-5 py-3 font-mono text-[13px] text-accent align-top whitespace-nowrap">
                          {e.name}
                        </td>
                        <td className="px-5 py-3 text-fg">
                          {e.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="retries" className="mt-16 scroll-mt-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Retries and idempotency
              </h2>
              <p className="mt-4 max-w-2xl text-fg-muted">
                BlockPay considers the delivery successful only on a 2xx
                response within five seconds. Other responses, timeouts and
                connection errors trigger retries with exponential backoff
                for up to 24 hours. Use the{" "}
                <InlineCode>X-BlockPay-Delivery</InlineCode> header as an
                idempotency key — the same delivery id will be reused across
                retries, but each delivery represents a single underlying
                event.
              </p>
            </section>

            <div className="mt-20 flex flex-wrap gap-3">
              <Link href="/docs/sdk" className="btn-pill text-sm">
                SDK helper
                <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
              <Link href="/docs/api" className="btn-pill text-sm">
                REST API reference
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

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--bg-elev)] px-1.5 py-0.5 font-mono text-[13px] text-fg">
      {children}
    </code>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const lines = code.split("\n");
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
      {label ? (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <span className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
            {label}
          </span>
          <span className="text-xs text-accent">BlockPay webhook</span>
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
