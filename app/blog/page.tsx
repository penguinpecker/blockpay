import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PaletteScope } from "@/components/palette-scope";

type Post = {
  date: string;
  title: string;
  preview: string;
};

const posts: Post[] = [
  {
    date: "2026-05-12",
    title: "Why we're building on Arc",
    preview:
      "A stablecoin-native L1 changes what a payment gateway can promise. We talk through the trade-offs and why Arc earned a slot in our default routing.",
  },
  {
    date: "2026-05-05",
    title: "The case for non-custodial stablecoin gateways",
    preview:
      "Custodial gateways carry counterparty risk that merchants increasingly aren't willing to absorb. Here's what changes when the funds never leave the merchant's wallet.",
  },
  {
    date: "2026-04-28",
    title: "Designing receipts for on-chain commerce",
    preview:
      "A receipt should be useful to humans, machines and auditors. We share the schema we settled on after three rewrites and one very painful integration.",
  },
];

export default function BlogPage() {
  return (
    <PaletteScope>
      <Nav active="Company" />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-8 pt-40 pb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              Blog
            </span>
            <h1
              className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-fg md:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-accent">Notes</span> from the team
            </h1>
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-sm uppercase tracking-[0.18em] text-fg-subtle">
              Articles coming soon
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <article
                  key={p.title}
                  className="card-frame flex h-full flex-col p-7"
                >
                  <time className="text-xs uppercase tracking-[0.16em] text-fg-subtle">
                    {p.date}
                  </time>
                  <h2 className="mt-4 font-display text-xl font-semibold text-fg">
                    {p.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                    {p.preview}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PaletteScope>
  );
}
