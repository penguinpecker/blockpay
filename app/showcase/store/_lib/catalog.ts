/**
 * Northwave Goods — demo merchant catalog.
 *
 * Hard-coded fictional product list used by the showcase storefront pages.
 * Prices are USD strings (dollars and cents). The cart converts to USDC
 * base units (6 decimals) at checkout time.
 *
 * Used by:
 *  - app/showcase/store/page.tsx           (catalog grid)
 *  - app/showcase/store/product/[slug]     (product detail)
 *  - app/showcase/store/cart/page.tsx      (line items)
 *  - app/showcase/store/cart/actions.ts    (server action — line items, totals)
 */

export type Product = {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  priceUsd: string;
  /** Hex fill colour used by the SVG illustration. Per-product accent. */
  accent: string;
  /** Soft secondary tone for shading. */
  accentSoft: string;
};

export const CATALOG: Product[] = [
  {
    slug: "northwave-tote",
    name: "Northwave Tote",
    blurb: "Heavy canvas. Honest stitching.",
    description:
      "A 16-ounce raw canvas tote sewn flat and lined twice along the strap. Big enough for a week's farmers' market haul, plain enough to disappear into any wardrobe. Made in small batches at a workshop in northern Portugal.",
    priceUsd: "48.00",
    accent: "#c2410c",
    accentSoft: "#e8a87c",
  },
  {
    slug: "cedar-mug",
    name: "Cedar Mug",
    blurb: "Stoneware, smoke-fired.",
    description:
      "Hand-thrown stoneware mug with a smoke-fired exterior and a creamy oat-coloured glaze inside. Holds 12 ounces. Each piece carries its own kiln history — no two share the same dappling.",
    priceUsd: "24.00",
    accent: "#7c5a3a",
    accentSoft: "#c9a983",
  },
  {
    slug: "highland-notebook",
    name: "Highland Notebook",
    blurb: "120 pages of writing room.",
    description:
      "Smyth-sewn notebook with a vegetable-tanned cover that ages with use. 120 ivory pages of 100gsm uncoated paper that takes fountain ink without ghosting. Lays flat at any spread.",
    priceUsd: "18.00",
    accent: "#3f6b4a",
    accentSoft: "#9bbfa3",
  },
  {
    slug: "olive-apron",
    name: "Olive Apron",
    blurb: "Long ties. Deep pockets.",
    description:
      "Cross-back apron cut from washed olive linen with leather neck-grommets and two front pockets that actually fit a paring knife. Pre-shrunk; only gets softer.",
    priceUsd: "36.00",
    accent: "#556b2f",
    accentSoft: "#a7b787",
  },
  {
    slug: "stone-coaster-set",
    name: "Stone Coaster Set (x4)",
    blurb: "Slate and lime. Cork-backed.",
    description:
      "A set of four cork-backed coasters cut from offcuts of natural slate and reclaimed limestone. Each set is paired by hand so the tones sit well together. 4 inches square.",
    priceUsd: "32.00",
    accent: "#4a5568",
    accentSoft: "#a0aec0",
  },
];

export function findProduct(slug: string): Product | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

/**
 * Convert a USD dollar string ("48.00") to USDC base units (× 1e6).
 * Returns a string of integer digits suitable for the invoice `amount` field.
 */
export function usdToUsdcBaseUnits(usd: string): string {
  // Defensive parse: only accept "digits.digits" or "digits".
  const m = /^(\d+)(?:\.(\d{1,6}))?$/.exec(usd.trim());
  if (!m) {
    throw new Error(`Invalid USD amount: ${usd}`);
  }
  const whole = m[1];
  const frac = (m[2] ?? "").padEnd(6, "0");
  // Trim leading zeros but keep at least one digit.
  const combined = (whole + frac).replace(/^0+(?=\d)/, "");
  return combined;
}

export function formatUsd(usd: string): string {
  const n = Number(usd);
  if (!Number.isFinite(n)) return `$${usd}`;
  return `$${n.toFixed(2)}`;
}
