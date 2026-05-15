"use client";

import { useState } from "react";
import { Copy, Archive, Check, Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

type PaymentLink = {
  id: string;
  name: string;
  amount: string;
  url: string;
  active: boolean;
  // seed for QR matrix
  seed: number;
};

const initialLinks: PaymentLink[] = [
  {
    id: "pl_3aQz81",
    name: "Standard checkout",
    amount: "$49.00",
    url: "https://pay.blockpay.io/p/3aQz81",
    active: true,
    seed: 1742,
  },
  {
    id: "pl_3aQyhB",
    name: "Annual membership",
    amount: "$240.00",
    url: "https://pay.blockpay.io/p/3aQyhB",
    active: true,
    seed: 9013,
  },
  {
    id: "pl_3aQwMv",
    name: "Studio session deposit",
    amount: "$120.00",
    url: "https://pay.blockpay.io/p/3aQwMv",
    active: true,
    seed: 4421,
  },
  {
    id: "pl_3aQt2C",
    name: "Workshop ticket",
    amount: "$35.00",
    url: "https://pay.blockpay.io/p/3aQt2C",
    active: true,
    seed: 6188,
  },
  {
    id: "pl_3aQq9F",
    name: "Bug bounty payout",
    amount: "Pay what you want",
    url: "https://pay.blockpay.io/p/3aQq9F",
    active: true,
    seed: 3357,
  },
  {
    id: "pl_3aQpzD",
    name: "Old launch promo",
    amount: "$19.00",
    url: "https://pay.blockpay.io/p/3aQpzD",
    active: false,
    seed: 8845,
  },
];

// Deterministic pseudo-random 12x12 matrix purely for visual flavour.
function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function QrPreview({ seed }: { seed: number }) {
  const size = 12;
  const rand = mulberry32(seed);
  const cells: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      row.push(rand() > 0.5);
    }
    cells.push(row);
  }

  // Fixed finder-pattern style corners so it still reads as a QR
  const isCorner = (x: number, y: number) => {
    const inTL = x < 3 && y < 3;
    const inTR = x >= size - 3 && y < 3;
    const inBL = x < 3 && y >= size - 3;
    return inTL || inTR || inBL;
  };
  const cornerFill = (x: number, y: number) => {
    let lx = x;
    let ly = y;
    if (x >= size - 3) lx = x - (size - 3);
    if (y >= size - 3) ly = y - (size - 3);
    // outer ring filled, middle hollow, center filled
    if (lx === 0 || lx === 2 || ly === 0 || ly === 2) return true;
    if (lx === 1 && ly === 1) return true;
    return false;
  };

  const cell = 100 / size;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-20 w-20 rounded-lg bg-white p-1.5"
      aria-label="Payment link QR preview"
    >
      {cells.map((row, y) =>
        row.map((on, x) => {
          const filled = isCorner(x, y) ? cornerFill(x, y) : on;
          if (!filled) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#0a0f0c"
            />
          );
        })
      )}
    </svg>
  );
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState(initialLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (link: PaymentLink) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(link.url);
      }
    } catch {
      // ignore — clipboard may not be available
    }
    setCopiedId(link.id);
    setTimeout(() => setCopiedId((c) => (c === link.id ? null : c)), 1600);
  };

  const handleArchive = (link: PaymentLink) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment links"
        description="Shareable, reusable links that route a customer straight to checkout."
        actions={
          <button type="button" className="btn-pill-solid text-sm">
            <Plus size={16} strokeWidth={2.6} />
            New link
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <article
            key={link.id}
            className="flex flex-col gap-4 rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-5"
          >
            <div className="flex items-start gap-4">
              <QrPreview seed={link.seed} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-base font-semibold text-white">
                    {link.name}
                  </h3>
                  {!link.active ? (
                    <span className="rounded-full border border-zinc-600/40 bg-zinc-700/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      Archived
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 font-display text-xl font-semibold text-[#4ade80]">
                  {link.amount}
                </div>
                <div className="mt-2 truncate font-mono text-xs text-zinc-500">
                  {link.url}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[rgba(74,222,128,0.10)] pt-3">
              <button
                type="button"
                onClick={() => handleCopy(link)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(74,222,128,0.45)]"
              >
                {copiedId === link.id ? (
                  <>
                    <Check size={13} strokeWidth={2.4} className="text-[#4ade80]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} strokeWidth={2} />
                    Copy URL
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleArchive(link)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white hover:border-[rgba(255,255,255,0.18)]"
              >
                <Archive size={13} strokeWidth={2} />
                {link.active ? "Archive" : "Restore"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
