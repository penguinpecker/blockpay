import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATALOG, formatUsd } from "./_lib/catalog";
import { ProductArt } from "./_lib/illustrations";
import { AddToCartButton } from "@/components/showcase-store/add-to-cart-button";

export default function NorthwaveCatalogPage() {
  return (
    <>
      <section className="nw-hero">
        <div className="nw-shell">
          <p className="nw-eyebrow nw-hero-eyebrow">
            New season · spring 2026
          </p>
          <h1 className="nw-hero-title">
            <em>Small batches.</em>
            <br />
            Built to age well.
          </h1>
          <p className="nw-hero-sub">
            Northwave is a tiny homeware studio on the Portuguese coast. We
            make a handful of objects each season — slowly, by hand, with
            materials we trust. Pay in stablecoins. Settle in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="#catalog" className="nw-btn nw-btn-primary">
              Browse the catalog
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link href="/showcase/store/cart" className="nw-btn nw-btn-ghost">
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section id="catalog" className="nw-shell">
        <div className="nw-grid">
          {CATALOG.map((p) => (
            <article key={p.slug} className="nw-card">
              <Link
                href={`/showcase/store/product/${p.slug}`}
                className="nw-card-art"
                aria-label={`View ${p.name}`}
              >
                <ProductArt slug={p.slug} />
              </Link>
              <div>
                <div className="nw-card-title">
                  <Link
                    href={`/showcase/store/product/${p.slug}`}
                    className="nw-card-name"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {p.name}
                  </Link>
                  <span className="nw-card-price">{formatUsd(p.priceUsd)}</span>
                </div>
                <p className="nw-card-blurb">{p.blurb}</p>
              </div>
              <div className="nw-card-actions">
                <AddToCartButton slug={p.slug} />
                <Link
                  href={`/showcase/store/product/${p.slug}`}
                  className="nw-btn nw-btn-ghost"
                >
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
