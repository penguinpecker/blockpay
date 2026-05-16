import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type Section = {
  title: string;
  body: string;
};

const sections: Section[] = [
  {
    title: "1. Use of service",
    body:
      "BlockPay provides software that lets merchants accept stablecoin payments and route them to wallets the merchant controls. By accessing the dashboard, embedding the checkout widget or calling the API, you agree to these terms. Continued use after a material change to the terms constitutes acceptance of the updated version.",
  },
  {
    title: "2. Eligibility",
    body:
      "You must be at least 18 years old and legally capable of forming a binding contract in your jurisdiction. You may not use the service if you are subject to sanctions, are located in a sanctioned jurisdiction, or are otherwise prohibited from receiving payment-processing software under applicable law.",
  },
  {
    title: "3. Merchant responsibilities",
    body:
      "Merchants are responsible for the accuracy of the wallet addresses they configure, for the goods and services they sell, and for handling disputes with their own customers. BlockPay does not adjudicate commercial disputes and cannot reverse a settled on-chain transaction.",
  },
  {
    title: "4. Customer responsibilities",
    body:
      "Customers paying through a BlockPay checkout are responsible for the wallet they use to pay, the network they pay on, and the accuracy of the payment amount before signing. Stablecoin transfers are final once confirmed on the underlying chain.",
  },
  {
    title: "5. Custody disclaimer",
    body:
      "BlockPay is non-custodial. Settlement is direct to the merchant's configured wallet on each payment. BlockPay never takes custody of customer funds, does not operate an omnibus account, and cannot freeze, recall or sweep balances that belong to merchants or customers.",
  },
  {
    title: "6. Fees and limits",
    body:
      "Fees are described on the pricing page and quoted at the moment a payment session is created. We may apply per-transaction or rolling-period limits to certain accounts; any such limits will be visible in the dashboard. Network gas and bridge fees are passed through and disclosed before signing.",
  },
  {
    title: "7. Compliance",
    body:
      "Merchants must comply with all laws applicable to their business, including tax, consumer-protection, sanctions and anti-money-laundering rules in every jurisdiction they serve. BlockPay may suspend or terminate access to the service to comply with applicable law or to mitigate identified risk.",
  },
  {
    title: "8. Risk disclosure",
    body:
      "Stablecoin payments rely on third-party issuers, public blockchains and bridge infrastructure that BlockPay does not operate. Token de-pegs, chain outages, bridge incidents and smart-contract bugs can affect settlement. BlockPay provides the software as-is, without warranty of merchantability or fitness for a particular purpose.",
  },
  {
    title: "9. Termination",
    body:
      "Either party may terminate this agreement at any time. On termination, your access to the dashboard and API will end, but on-chain assets in your own wallet remain under your control. We will retain records as required by applicable law and as described in the Privacy Policy.",
  },
  {
    title: "10. Contact",
    body:
      "Questions about these terms can be sent to hello@blockpay.dev. We will respond within a reasonable period during our published support hours.",
  },
];

export default function TermsPage() {
  return (
    <PaletteScope>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Legal
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Terms of <span className="text-accent">Service</span>
            </h1>
            <p className="mt-6 text-sm text-fg-subtle">Last updated: 2026-05-15</p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-8 py-10 md:px-12">
            <div className="space-y-10">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-xl font-semibold text-fg">
                    {s.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}
