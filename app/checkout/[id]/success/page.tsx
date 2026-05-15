import Link from "next/link";
import { CheckCircle2, Download, ChevronRight } from "lucide-react";
import { Receipt } from "@/components/checkout/receipt";

const LINE_ITEMS = [
  { label: "Pro Plan – Monthly", amount: "$49.00" },
  { label: "Tax (8%)", amount: "$3.92" },
  { label: "Total", amount: "$52.92", emphasis: true },
];

const META = [
  {
    label: "Transaction",
    value: "0x9c4f…7a1e",
    mono: true,
  },
  {
    label: "Receipt CID",
    value: "bafyb…rk2q",
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

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="card-frame glow-accent p-6 md:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(74,222,128,0.12)]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.35),transparent_70%)] blur-md" />
              <CheckCircle2
                size={40}
                strokeWidth={2}
                className="relative text-accent"
              />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
              Payment <span className="text-accent">received</span>
            </h1>
            <p className="mt-2 max-w-xs text-sm text-zinc-400">
              Invoice {id} settled on-chain. A signed receipt has been pinned to
              IPFS.
            </p>
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

          <div className="mt-5 border-t border-white/5 pt-4 text-center text-[11px] text-zinc-500">
            Powered by <span className="text-accent">BlockPay</span>
          </div>
        </div>
      </div>
    </main>
  );
}
