import { Users, Send, Bell, Receipt } from "lucide-react";

type Action = {
  title: string;
  body: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const actions: Action[] = [
  {
    title: "Phonebook contacts",
    body: "Save people by ENS, SNS, or email. Send them money in one tap — no copy-pasted addresses, no scary hex strings.",
    Icon: Users,
  },
  {
    title: "Send and receive USDC",
    body: "Pay anyone, anywhere. Gas is sponsored by Circle Paymaster, so you never need to hold a native token to move money.",
    Icon: Send,
  },
  {
    title: "Payment requests and reminders",
    body: "Send a Venmo-style request with a note. If it sits unpaid, we’ll email a polite reminder on your behalf.",
    Icon: Bell,
  },
  {
    title: "Verifiable receipts",
    body: "Every payment ships with an EIP-712 signed receipt referenced on-chain. Audit-grade for taxes, exportable for your accountant.",
    Icon: Receipt,
  },
];

export function UserActionsSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            What you can do
          </h2>
          <p className="mt-5 text-fg-muted">
            BlockPay is a wallet you can actually use. The parts you’d
            recognise from Venmo, with the settlement guarantees of USDC on a
            public chain.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {actions.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="card-frame flex gap-6 p-8 transition-colors hover:card-active"
            >
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elev)] text-accent"
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-fg">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-fg-muted">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
