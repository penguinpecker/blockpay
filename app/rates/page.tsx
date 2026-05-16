import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type Row = {
  pair: string;
  rate: string;
  inverse: string;
  source: string;
};

const rows: Row[] = [
  { pair: "USDC / USD", rate: "1.0000", inverse: "1.0000", source: "Circle mint price" },
  { pair: "USDC / EUR", rate: "0.9213", inverse: "1.0854", source: "FX oracle, 5s window" },
  { pair: "EURC / EUR", rate: "1.0000", inverse: "1.0000", source: "Circle mint price" },
  { pair: "EURC / USD", rate: "1.0854", inverse: "0.9213", source: "FX oracle, 5s window" },
  { pair: "USDC / GBP", rate: "0.7891", inverse: "1.2673", source: "FX oracle, 5s window" },
  { pair: "USDC / JPY", rate: "154.32", inverse: "0.00648", source: "FX oracle, 5s window" },
];

export default function RatesPage() {
  return (
    <PaletteScope>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Rates
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Exchange <span className="text-accent">Rates</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-fg-muted">
              Indicative quotes. The rate applied to any given payment is
              determined at the moment the session is created, via the Circle
              stack.
            </p>
          </div>
        </section>

        <section className="px-8 pb-16">
          <div className="mx-auto max-w-4xl card-frame px-8 py-10 md:px-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-strong)]">
                    <th className="pb-4 font-display text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Pair
                    </th>
                    <th className="pb-4 font-display text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Rate
                    </th>
                    <th className="pb-4 font-display text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Inverse
                    </th>
                    <th className="pb-4 font-display text-xs uppercase tracking-[0.16em] text-fg-subtle">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.pair}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-4 font-display text-base font-semibold text-fg">
                        {r.pair}
                      </td>
                      <td className="tnum py-4 font-mono text-sm text-fg">
                        {r.rate}
                      </td>
                      <td className="tnum py-4 font-mono text-sm text-fg-muted">
                        {r.inverse}
                      </td>
                      <td className="py-4 text-sm text-fg-muted">{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-8 text-xs text-fg-subtle">
              Rates are quoted at payment time via the Circle stack. For payments
              made in non-USDC tokens, Bridge Kit handles routing and conversion,
              with the customer-side quote disclosed before signing.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}
