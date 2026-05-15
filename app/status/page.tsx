import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

type Status = "Operational" | "Degraded" | "Live";

type Row = {
  service: string;
  status: Status;
  note?: string;
};

const rows: Row[] = [
  { service: "Marketing site", status: "Operational" },
  { service: "Merchant dashboard", status: "Operational" },
  { service: "Checkout widget", status: "Operational" },
  { service: "Backend API", status: "Operational" },
  {
    service: "Indexer (Base Sepolia)",
    status: "Degraded",
    note: "Public RPC throttling — fix planned",
  },
  { service: "Indexer (Arc Testnet)", status: "Operational" },
  { service: "Smart contracts (Base Sepolia, Arc Testnet)", status: "Live" },
];

const statusColor: Record<Status, string> = {
  Operational: "bg-[#22c55e]",
  Degraded: "bg-[#f59e0b]",
  Live: "bg-[#22c55e]",
};

const statusTextColor: Record<Status, string> = {
  Operational: "text-[#4ade80]",
  Degraded: "text-[#fbbf24]",
  Live: "text-[#4ade80]",
};

export default function StatusPage() {
  return (
    <>
      <Nav active="Developers" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.06)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Status
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              <span className="text-accent">System</span> status
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-zinc-300">
              A live snapshot of BlockPay surfaces and infrastructure. Updated
              alongside deploys; full incident history coming soon.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-4xl card-frame px-8 py-10 md:px-12">
            <ul className="divide-y divide-[rgba(74,222,128,0.12)]">
              {rows.map((r) => (
                <li
                  key={r.service}
                  className="flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-block h-3 w-3 shrink-0 rounded-full ${statusColor[r.status]}`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-display text-base font-semibold text-white">
                        {r.service}
                      </div>
                      {r.note && (
                        <div className="mt-1 text-xs text-zinc-500">
                          {r.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.18em] ${statusTextColor[r.status]}`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-4xl card-frame-tight px-8 py-6 text-sm text-zinc-400">
            <span className="font-display text-xs uppercase tracking-[0.16em] text-zinc-500">
              Deployment addresses
            </span>
            <p className="mt-3 leading-relaxed">
              Router at{" "}
              <span className="font-mono text-accent">
                0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F
              </span>{" "}
              on both Base Sepolia and Arc Testnet.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
