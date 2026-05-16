import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type Country = {
  name: string;
  iso: string;
};

const countries: Country[] = [
  { name: "United States", iso: "US" },
  { name: "United Kingdom", iso: "GB" },
  { name: "Germany", iso: "DE" },
  { name: "France", iso: "FR" },
  { name: "Spain", iso: "ES" },
  { name: "Italy", iso: "IT" },
  { name: "Netherlands", iso: "NL" },
  { name: "Belgium", iso: "BE" },
  { name: "Ireland", iso: "IE" },
  { name: "Switzerland", iso: "CH" },
  { name: "Norway", iso: "NO" },
  { name: "Sweden", iso: "SE" },
  { name: "Denmark", iso: "DK" },
  { name: "Finland", iso: "FI" },
  { name: "Canada", iso: "CA" },
  { name: "Mexico", iso: "MX" },
  { name: "Brazil", iso: "BR" },
  { name: "Argentina", iso: "AR" },
  { name: "Chile", iso: "CL" },
  { name: "Colombia", iso: "CO" },
  { name: "India", iso: "IN" },
  { name: "Singapore", iso: "SG" },
  { name: "Hong Kong", iso: "HK" },
  { name: "Japan", iso: "JP" },
  { name: "South Korea", iso: "KR" },
  { name: "Australia", iso: "AU" },
  { name: "New Zealand", iso: "NZ" },
  { name: "UAE", iso: "AE" },
  { name: "Saudi Arabia", iso: "SA" },
  { name: "South Africa", iso: "ZA" },
  { name: "Nigeria", iso: "NG" },
];

export default function CountriesPage() {
  return (
    <PaletteScope>
      <Nav active="Resources" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Coverage
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Supported <span className="text-accent">countries</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base text-fg-muted">
              BlockPay payments work in 30+ countries today; merchants must
              verify local compliance before going live.
            </p>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {countries.map((c) => (
                <div
                  key={c.iso}
                  className="card-frame-tight flex items-center justify-between px-5 py-4"
                >
                  <span className="font-display text-base font-semibold text-fg">
                    {c.name}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-fg-muted">
                    {c.iso}
                  </span>
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
