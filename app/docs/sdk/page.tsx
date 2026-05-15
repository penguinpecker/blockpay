import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "JavaScript SDK — BlockPay docs",
  description:
    "Full reference for @blockpay/checkout: install, initialize, invoices, payment links, webhook verification and receipt verification.",
};

const installCode = `npm install @blockpay/checkout`;

const initCode = `import { BlockPay } from "@blockpay/checkout";

const bp = new BlockPay({
  apiKey: process.env.BLOCKPAY_API_KEY!,
  // Optional. Defaults to https://api.blockpay.dev
  baseUrl: "https://api.blockpay.dev",
});`;

const invoicesCreateCode = `const invoice = await bp.invoices.create({
  amount: "49.00",
  currency: "USDC",
  chainKey: "base",
  merchantAddress: "0xYourSettlementWallet",
  lineItems: [{ label: "Pro Plan", amount: "49.00" }],
  // Optional. Unix seconds.
  expiresAt: Math.floor(Date.now() / 1000) + 60 * 30,
});

console.log(invoice.id);          // "inv_01HE2..."
console.log(invoice.checkoutUrl); // "/checkout/inv_01HE2..."`;

const invoicesGetCode = `const invoice = await bp.invoices.get("inv_01HE2...");
if (invoice.status === "paid") {
  // fulfill the order
}`;

const invoicesListCode = `const { invoices } = await bp.invoices.list({
  merchantId: "merchant_acme",
  status: "open",
});`;

const paymentLinksCode = `// One-off link: tied to a single invoice.
const link = await bp.paymentLinks.create({
  amount: "12.00",
  currency: "USDC",
  chainKey: "base",
  merchantAddress: "0xYourSettlementWallet",
  description: "Coffee, large",
});

// Reusable link: same URL accepts many distinct payments.
const reusable = await bp.paymentLinks.create({
  amount: "12.00",
  currency: "USDC",
  chainKey: "base",
  merchantAddress: "0xYourSettlementWallet",
  reusable: true,
});`;

const webhooksCode = `import { verifyWebhook } from "@blockpay/checkout/webhooks";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-blockpay-signature") ?? "";

  const event = verifyWebhook({
    payload: raw,
    signature,
    secret: process.env.BLOCKPAY_WEBHOOK_SECRET!,
  });

  switch (event.type) {
    case "invoice.paid":
      // event.data.invoice
      break;
  }

  return new Response("ok");
}`;

const receiptsCode = `// Verify a signed receipt CID produced by the BlockPay indexer.
const receipt = await bp.receipts.verify({
  cid: "0x9b1c...e3f0",
});

if (receipt.valid) {
  console.log(receipt.invoiceId, receipt.txHash, receipt.amount);
}`;

type Section = {
  id: string;
  title: string;
};

const sections: Section[] = [
  { id: "install", title: "Install" },
  { id: "initialize", title: "Initialize" },
  { id: "invoices", title: "Invoices" },
  { id: "payment-links", title: "Payment Links" },
  { id: "webhooks", title: "Webhooks" },
  { id: "receipts", title: "Receipts" },
];

export default function SdkPage() {
  return (
    <>
      <Nav active="Docs" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-8 py-24">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              JavaScript SDK
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              The <span className="text-accent">@blockpay/checkout</span>{" "}
              reference.
            </h1>
            <p className="mt-7 max-w-2xl text-zinc-300">
              A small, sharp surface for stablecoin checkout. Six methods, one
              type-safe client, zero ceremony.
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
              <Block id="install" title="Install">
                <p className="text-zinc-400">
                  Add the SDK to your project. It is a pure ESM package, ships
                  with TypeScript declarations, and has zero runtime
                  dependencies.
                </p>
                <CodeBlock code={installCode} label="bash" lang="bash" />
              </Block>

              <Block id="initialize" title="Initialize">
                <p className="text-zinc-400">
                  Construct a single client and reuse it. The API key is a
                  secret — keep it server-side.
                </p>
                <Signature>
                  new BlockPay(options:{" "}
                  <span className="text-[#a5f3fc]">BlockPayOptions</span>):{" "}
                  <span className="text-[#a5f3fc]">BlockPay</span>
                </Signature>
                <CodeBlock code={initCode} label="server.ts" />
              </Block>

              <Block id="invoices" title="Invoices">
                <p className="text-zinc-400">
                  Invoices are the canonical record of a charge. Create one,
                  redirect the customer to{" "}
                  <InlineCode>invoice.checkoutUrl</InlineCode>, and your
                  webhook handler fires when the on-chain transfer lands.
                </p>

                <Subhead>bp.invoices.create</Subhead>
                <Signature>
                  bp.invoices.create(params:{" "}
                  <span className="text-[#a5f3fc]">CreateInvoiceParams</span>):{" "}
                  <span className="text-[#a5f3fc]">Promise&lt;Invoice&gt;</span>
                </Signature>
                <p className="mt-3 text-zinc-400">
                  Creates a fresh invoice in <InlineCode>open</InlineCode>{" "}
                  state. The chain and currency lock the settlement asset; you
                  cannot switch them after creation.
                </p>
                <CodeBlock code={invoicesCreateCode} label="invoices.create" />

                <Subhead>bp.invoices.get</Subhead>
                <Signature>
                  bp.invoices.get(id:{" "}
                  <span className="text-[#fde68a]">string</span>):{" "}
                  <span className="text-[#a5f3fc]">Promise&lt;Invoice&gt;</span>
                </Signature>
                <p className="mt-3 text-zinc-400">
                  Fetches a single invoice by id. Returns the latest known
                  status, including which chain transaction settled it.
                </p>
                <CodeBlock code={invoicesGetCode} label="invoices.get" />

                <Subhead>bp.invoices.list</Subhead>
                <Signature>
                  bp.invoices.list(filter:{" "}
                  <span className="text-[#a5f3fc]">InvoiceFilter</span>):{" "}
                  <span className="text-[#a5f3fc]">
                    Promise&lt;{"{ invoices: Invoice[] }"}&gt;
                  </span>
                </Signature>
                <p className="mt-3 text-zinc-400">
                  Lists invoices, optionally filtered by merchant or status.
                  Useful for backfilling your own database.
                </p>
                <CodeBlock code={invoicesListCode} label="invoices.list" />
              </Block>

              <Block id="payment-links" title="Payment Links">
                <p className="text-zinc-400">
                  Payment links are shareable URLs that produce invoices on
                  demand. Use a one-off link to charge a specific customer, or
                  a reusable link to drop a checkout into a Linktree, email
                  signature or QR code.
                </p>
                <Signature>
                  bp.paymentLinks.create(params:{" "}
                  <span className="text-[#a5f3fc]">CreatePaymentLinkParams</span>
                  ):{" "}
                  <span className="text-[#a5f3fc]">
                    Promise&lt;PaymentLink&gt;
                  </span>
                </Signature>
                <CodeBlock code={paymentLinksCode} label="paymentLinks.create" />
              </Block>

              <Block id="webhooks" title="Webhooks">
                <p className="text-zinc-400">
                  Webhooks fire on every state change. The SDK ships a helper
                  that verifies the signature using a constant-time comparison
                  and gives you a typed event back.
                </p>
                <Signature>
                  verifyWebhook(params:{" "}
                  <span className="text-[#a5f3fc]">VerifyWebhookParams</span>):{" "}
                  <span className="text-[#a5f3fc]">BlockPayEvent</span>
                </Signature>
                <p className="mt-3 text-zinc-400">
                  Throws if the signature does not match. Always pass the raw
                  request body — re-serialised JSON will not match the
                  signature.
                </p>
                <CodeBlock code={webhooksCode} label="route.ts" />
              </Block>

              <Block id="receipts" title="Receipts">
                <p className="text-zinc-400">
                  Every settled invoice produces a signed receipt CID. Verify
                  it client-side to prove fulfilment without trusting the
                  merchant or the BlockPay API.
                </p>
                <Signature>
                  bp.receipts.verify(params:{" "}
                  <span className="text-[#a5f3fc]">VerifyReceiptParams</span>):{" "}
                  <span className="text-[#a5f3fc]">
                    Promise&lt;VerifiedReceipt&gt;
                  </span>
                </Signature>
                <CodeBlock code={receiptsCode} label="receipts.verify" />
              </Block>
            </div>

            <div className="mt-20 flex flex-wrap gap-3">
              <Link href="/docs/api" className="btn-pill text-sm">
                REST API reference
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
    </>
  );
}

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 font-display text-lg font-semibold text-white">
      <InlineCode>{children}</InlineCode>
    </h3>
  );
}

function Signature({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-[rgba(74,222,128,0.18)] bg-black px-4 py-3 font-mono text-[13px] text-zinc-300">
      {children}
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
    <div className="mt-4 overflow-hidden rounded-2xl border border-[rgba(74,222,128,0.18)] bg-black">
      {label ? (
        <div className="flex items-center justify-between border-b border-[rgba(74,222,128,0.18)] px-5 py-3">
          <span className="font-display text-xs uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </span>
          {lang ? (
            <span className="text-xs text-accent">{lang}</span>
          ) : (
            <span className="text-xs text-accent">@blockpay/checkout</span>
          )}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="select-none text-zinc-600" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre text-zinc-300">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
