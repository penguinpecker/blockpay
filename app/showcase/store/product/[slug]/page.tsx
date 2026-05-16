import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CATALOG, findProduct, formatUsd } from "../../_lib/catalog";
import { ProductArt } from "../../_lib/illustrations";
import { QtyAddForm } from "@/components/showcase-store/qty-add-form";

export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) {
    notFound();
  }

  return (
    <div className="nw-shell">
      <div className="pt-8">
        <Link
          href="/showcase/store"
          className="nw-link inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Back to catalog
        </Link>
      </div>

      <section className="nw-detail">
        <div className="nw-detail-art">
          <ProductArt slug={product.slug} />
        </div>
        <div>
          <p className="nw-eyebrow">Northwave Goods</p>
          <h1 className="nw-detail-title mt-2">{product.name}</h1>
          <p className="nw-detail-blurb">{product.blurb}</p>
          <p className="nw-detail-price">{formatUsd(product.priceUsd)}</p>
          <p className="nw-detail-body">{product.description}</p>
          <div className="mt-8">
            <QtyAddForm slug={product.slug} />
          </div>
          <p className="mt-6 text-xs text-[var(--nw-fg-subtle)]">
            Settled in USDC on Arc testnet via BlockPay. Demo storefront —
            no physical orders ship.
          </p>
        </div>
      </section>
    </div>
  );
}
