import Link from "next/link";
import { CheckCircle2, Download, ChevronRight } from "lucide-react";
import { Receipt, StepRail, type Step } from "@/components/checkout/receipt";

const LINE_ITEMS = [
  { label: "Pro Plan – Monthly", amount: "$49.00" },
  { label: "Tax (8%)", amount: "$3.92" },
  { label: "Total", amount: "$52.92", emphasis: true },
];

const FULL_TX = "0x9c4f8be41eb7da27f0e54d33d9fbb31e7c0a91557a1e";
const FULL_CID = "bafybeibhqxgw3p7jw2sw4xq2r4r34oxk5bcd6kek2q";

const META = [
  {
    label: "Transaction",
    value: `${FULL_TX.slice(0, 6)}…${FULL_TX.slice(-4)}`,
    fullValue: FULL_TX,
    mono: true,
  },
  {
    label: "Receipt CID",
    value: `${FULL_CID.slice(0, 6)}…${FULL_CID.slice(-4)}`,
    fullValue: FULL_CID,
    mono: true,
  },
  {
    label: "Chain",
    value: "Arc",
  },
  {
    label: "Settled",
    value: "USDC · Instant",
  },
];

const COMPLETED_STEPS: Step[] = [
  { label: "Pay", state: "complete" },
  { label: "Submit", state: "complete" },
  { label: "Confirm", state: "complete" },
  { label: "Settled", state: "complete" },
];

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="palette-stealth relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="card-frame card-active p-6 md:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--mint)_12%,transparent)]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--mint)_35%,transparent),transparent_70%)] blur-md" />
              <CheckCircle2
                size={40}
                strokeWidth={2}
                className="relative text-[var(--mint)]"
              />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
              Payment received
            </h1>
            <p className="mt-2 max-w-xs text-sm text-[var(--fg-muted)]">
              Invoice {id} settled on-chain. A signed receipt has been pinned to
              IPFS.
            </p>
          </div>

          <div className="mt-6">
            <StepRail steps={COMPLETED_STEPS} />
          </div>

          <div className="mt-6">
            <Receipt lines={LINE_ITEMS} meta={META} />
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              className="btn-pill w-full justify-center text-sm"
            >
              <Download size={16} strokeWidth={2.4} />
              Download receipt
            </button>
            <Link
              href="/"
              className="btn-pill-solid w-full justify-center text-sm"
            >
              Back to merchant
              <ChevronRight size={16} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4 text-center text-[11px] text-[var(--fg-subtle)]">
            Powered by BlockPay
          </div>
        </div>
      </div>
    </main>
  );
}
