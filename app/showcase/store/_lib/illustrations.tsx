/**
 * Original SVG illustrations for the Northwave catalog.
 *
 * These are abstract / geometric stand-ins for product photography —
 * intentionally unbranded, no copying of real product shapes. Each one
 * reads as "a thing that could be a tote / a mug / a notebook" without
 * being recognisably any real-world object.
 *
 * Pick by slug via <ProductArt slug="..." />.
 */

import type { CSSProperties } from "react";
import { CATALOG, findProduct } from "./catalog";

type Props = {
  slug: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

function Tote({ accent, soft }: { accent: string; soft: string }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Tote illustration">
      <rect width="200" height="200" fill="#f3ede2" rx="14" />
      {/* strap */}
      <path
        d="M 70 50 Q 100 14 130 50"
        stroke={accent}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* body */}
      <rect x="50" y="60" width="100" height="110" rx="6" fill={accent} />
      <rect x="50" y="60" width="100" height="14" fill={soft} opacity="0.55" />
      {/* stitch line */}
      <line
        x1="60"
        y1="168"
        x2="140"
        y2="168"
        stroke={soft}
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      {/* tag */}
      <rect x="92" y="100" width="16" height="22" fill={soft} opacity="0.85" />
    </svg>
  );
}

function Mug({ accent, soft }: { accent: string; soft: string }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Mug illustration">
      <rect width="200" height="200" fill="#f3ede2" rx="14" />
      {/* steam */}
      <path
        d="M 84 36 Q 78 50 84 64"
        stroke={soft}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 110 30 Q 102 46 110 60"
        stroke={soft}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* handle */}
      <path
        d="M 142 96 Q 172 96 172 124 Q 172 152 142 152"
        stroke={accent}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      {/* body */}
      <rect x="56" y="78" width="88" height="92" rx="8" fill={accent} />
      {/* glaze rim */}
      <rect x="56" y="78" width="88" height="12" fill={soft} opacity="0.8" />
      {/* speckles */}
      <circle cx="74" cy="118" r="2" fill={soft} opacity="0.7" />
      <circle cx="102" cy="138" r="2.5" fill={soft} opacity="0.7" />
      <circle cx="124" cy="124" r="1.8" fill={soft} opacity="0.7" />
      <circle cx="88" cy="148" r="1.6" fill={soft} opacity="0.7" />
    </svg>
  );
}

function Notebook({ accent, soft }: { accent: string; soft: string }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Notebook illustration">
      <rect width="200" height="200" fill="#f3ede2" rx="14" />
      {/* back cover */}
      <rect x="44" y="36" width="108" height="132" rx="4" fill={soft} />
      {/* pages */}
      <rect x="48" y="40" width="100" height="124" fill="#fbf7ec" />
      {/* front cover slightly offset */}
      <rect x="52" y="44" width="100" height="124" rx="4" fill={accent} />
      {/* binding stitches */}
      <line x1="64" y1="58" x2="64" y2="156" stroke={soft} strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
      {/* embossed strip */}
      <rect x="76" y="92" width="56" height="2" fill={soft} opacity="0.6" />
      <rect x="76" y="100" width="36" height="2" fill={soft} opacity="0.4" />
    </svg>
  );
}

function Apron({ accent, soft }: { accent: string; soft: string }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Apron illustration">
      <rect width="200" height="200" fill="#f3ede2" rx="14" />
      {/* neck strap */}
      <path
        d="M 80 40 Q 100 26 120 40"
        stroke="#7a6b52"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* bib */}
      <path
        d="M 80 50 L 120 50 L 134 96 L 66 96 Z"
        fill={accent}
      />
      {/* skirt */}
      <path
        d="M 60 96 L 140 96 L 150 172 L 50 172 Z"
        fill={accent}
      />
      {/* waist ties */}
      <rect x="44" y="98" width="20" height="6" fill="#7a6b52" rx="2" />
      <rect x="136" y="98" width="20" height="6" fill="#7a6b52" rx="2" />
      {/* pocket */}
      <rect x="82" y="120" width="36" height="22" fill={soft} opacity="0.75" />
      <line x1="100" y1="120" x2="100" y2="142" stroke={accent} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function Coasters({ accent, soft }: { accent: string; soft: string }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Coaster set illustration">
      <rect width="200" height="200" fill="#f3ede2" rx="14" />
      {/* four overlapping coaster squares */}
      <rect x="34" y="34" width="64" height="64" rx="3" fill={soft} opacity="0.9" />
      <rect x="102" y="44" width="64" height="64" rx="3" fill={accent} opacity="0.9" />
      <rect x="44" y="106" width="64" height="64" rx="3" fill={accent} opacity="0.85" />
      <rect x="110" y="116" width="64" height="64" rx="3" fill={soft} opacity="0.95" />
      {/* stone fleck details */}
      <circle cx="60" cy="60" r="2" fill="#3b3a36" opacity="0.4" />
      <circle cx="80" cy="78" r="1.5" fill="#3b3a36" opacity="0.4" />
      <circle cx="130" cy="64" r="2.2" fill="#fbf7ec" opacity="0.7" />
      <circle cx="146" cy="86" r="1.6" fill="#fbf7ec" opacity="0.6" />
      <circle cx="72" cy="138" r="2" fill="#fbf7ec" opacity="0.7" />
      <circle cx="138" cy="148" r="1.8" fill="#3b3a36" opacity="0.4" />
    </svg>
  );
}

const ART_BY_SLUG: Record<string, (props: { accent: string; soft: string }) => React.JSX.Element> = {
  "northwave-tote": Tote,
  "cedar-mug": Mug,
  "highland-notebook": Notebook,
  "olive-apron": Apron,
  "stone-coaster-set": Coasters,
};

export function ProductArt({ slug, size, className, style }: Props) {
  const product = findProduct(slug);
  if (!product) {
    // graceful fallback so we don't 500 if a stale slug is referenced
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: "#f3ede2", ...style }}
        aria-hidden="true"
      />
    );
  }
  const Art = ART_BY_SLUG[slug] ?? Tote;
  return (
    <div
      className={className}
      style={{ width: size, height: size, ...style }}
    >
      <Art accent={product.accent} soft={product.accentSoft} />
    </div>
  );
}

export const ALL_SLUGS = CATALOG.map((p) => p.slug);
