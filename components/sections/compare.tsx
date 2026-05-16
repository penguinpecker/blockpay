const rows = [
  {
    criteria: "Decentralization",
    blockpay: "Offers true decentralization in every transaction",
    traditional: "Typically operates on centralized infrastructure",
  },
  {
    criteria: "Integration Process",
    blockpay: "One-click seamless integration",
    traditional: "Complex setup processes may be required",
  },
  {
    criteria: "Settlement Speed",
    blockpay: "Instant settlement of funds",
    traditional: "Delayed settlement times are not uncommon",
  },
  {
    criteria: "Transaction Security",
    blockpay: "Utilizes decentralized networks for enhanced security",
    traditional: "Primarily relies on centralized security measures",
  },
  {
    criteria: "Transaction Accessibility",
    blockpay: "Centralized hub for organized and accessible transactions",
    traditional: "Transactions may be scattered and harder to manage",
  },
  {
    criteria: "Invoice Customization",
    blockpay: "Allows customization of invoices to match unique business needs",
    traditional: "Limited flexibility in invoice customization",
  },
];

export function CompareSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            Why Choose BlockPay?
          </h2>
          <p className="mt-5 text-fg-muted">
            At BlockPay, we stand at the forefront of Web3 payments, offering a
            revolutionary alternative to traditional payment gateways. Below is
            a comprehensive comparison highlighting the advantages of choosing
            BlockPay over conventional options.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-[var(--border)]">
          <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr] bg-[var(--bg-elev)] text-fg">
            <Cell heading>Criteria</Cell>
            <Cell heading>BlockPay</Cell>
            <Cell heading>Traditional Gateways</Cell>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.criteria}
              className={`grid grid-cols-[1.1fr_1.4fr_1.4fr] ${
                i !== rows.length - 1
                  ? "border-b border-[var(--border)]"
                  : ""
              }`}
            >
              <Cell strong>{r.criteria}</Cell>
              <Cell>{r.blockpay}</Cell>
              <Cell>{r.traditional}</Cell>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cell({
  children,
  heading,
  strong,
}: {
  children: React.ReactNode;
  heading?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${
        heading
          ? "font-display text-base font-semibold"
          : strong
            ? "border-r border-[var(--border)] font-display text-base font-semibold text-fg"
            : "border-r border-[var(--border)] text-sm text-fg-muted last:border-r-0"
      }`}
    >
      {children}
    </div>
  );
}
