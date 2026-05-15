import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type Section = {
  title: string;
  body: string;
};

const sections: Section[] = [
  {
    title: "1. Data we collect",
    body:
      "We collect the data you give us when you create an account: a contact email, your business name and country, and the wallet address you choose for settlement. When you use the dashboard or API we also collect technical metadata — request timestamps, IP address, browser fingerprint at the level needed for fraud prevention, and event logs tied to your account.",
  },
  {
    title: "2. How we use it",
    body:
      "We use your data to operate the service, secure it against abuse, communicate with you about your account, and meet legal and regulatory obligations. We use aggregated, non-identifying metrics to understand product performance and to plan capacity.",
  },
  {
    title: "3. Sharing",
    body:
      "We share data with infrastructure providers strictly as needed to deliver the service (hosting, email, analytics, payment-token issuers). We do not sell personal data. We disclose data to authorities only when compelled by a valid legal process or to protect the safety of users.",
  },
  {
    title: "4. Data retention",
    body:
      "We retain account data for as long as your account is active and for a reasonable period after closure to satisfy legal, accounting and dispute-resolution requirements. Event-level technical logs are retained on a rolling window appropriate to their purpose.",
  },
  {
    title: "5. Your rights",
    body:
      "Subject to applicable law, you have the right to access, correct, export or delete your personal data. Send requests to privacy@blockpay.dev. We will respond within the timeframe required by your local jurisdiction.",
  },
  {
    title: "6. Cookies",
    body:
      "The marketing site uses minimal first-party cookies for session state and aggregate analytics. The dashboard uses cookies that are strictly necessary to keep you signed in. You can disable cookies in your browser, though some features will stop working without them.",
  },
  {
    title: "7. Children",
    body:
      "The service is not directed at children under 16, and we do not knowingly collect personal data from anyone under that age. If you believe we have collected data from a child, contact privacy@blockpay.dev and we will delete it.",
  },
  {
    title: "8. Changes",
    body:
      "We may update this policy as the product evolves. Material changes will be flagged in the dashboard and announced by email at least 14 days before they take effect.",
  },
  {
    title: "9. Contact",
    body:
      "Privacy questions can be sent to privacy@blockpay.dev. For general support, hello@blockpay.dev is the better address.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Legal
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Privacy <span className="text-accent">Policy</span>
            </h1>
            <p className="mt-6 text-sm text-zinc-500">Last updated: 2026-05-15</p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-3xl card-frame px-8 py-10 md:px-12">
            <div className="space-y-10">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-xl font-semibold text-white">
                    {s.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
