import { Chip } from "./chip";

export type ChainBalance = {
  name: string;
  amount: number;
  color: string;
};

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function ChainDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 8px -1px ${color}`,
      }}
    />
  );
}

export function BalanceCard({
  total,
  chains,
}: {
  total: number;
  chains: ChainBalance[];
}) {
  return (
    <section
      className="card-frame glow-accent relative overflow-hidden px-6 py-7"
      aria-label="USDC balance"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 right-[-30%] h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(74,222,128,0.35), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Total balance
          </span>
          <Chip tone="accent">USDC</Chip>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tracking-tight text-white">
            ${formatUsd(total)}
          </span>
        </div>

        <p className="mt-1 text-sm text-zinc-500">
          Across {chains.length} chains
        </p>

        <ul
          className="-mr-4 mt-6 flex gap-2 overflow-x-auto pb-1 pr-4"
          aria-label="Chain balances"
        >
          {chains.map((chain) => (
            <li key={chain.name} className="shrink-0">
              <div className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5">
                <ChainDot color={chain.color} />
                <span className="text-xs font-semibold text-white">
                  {chain.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatUsd(chain.amount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
