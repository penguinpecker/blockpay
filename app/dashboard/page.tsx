import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusPill, type StatusVariant } from "@/components/dashboard/status-pill";

type RecentPayment = {
  id: string;
  customer: string;
  amount: string;
  chain: string;
  status: StatusVariant;
  date: string;
};

const recentPayments: RecentPayment[] = [
  {
    id: "pmt_3kJ29x",
    customer: "lena@northwave.io",
    amount: "$129.00",
    chain: "Base",
    status: "success",
    date: "May 15, 09:42",
  },
  {
    id: "pmt_3kJ24q",
    customer: "rio.eth",
    amount: "$48.20",
    chain: "Solana",
    status: "success",
    date: "May 15, 09:18",
  },
  {
    id: "pmt_3kIzaP",
    customer: "studios@parallax.xyz",
    amount: "$312.00",
    chain: "Polygon",
    status: "pending",
    date: "May 15, 08:51",
  },
  {
    id: "pmt_3kIyvL",
    customer: "mark@goodmail.com",
    amount: "$24.00",
    chain: "Arbitrum",
    status: "failed",
    date: "May 14, 21:09",
  },
  {
    id: "pmt_3kIuhB",
    customer: "ana@northwave.io",
    amount: "$96.00",
    chain: "Base",
    status: "refunded",
    date: "May 14, 17:34",
  },
];

const recentColumns: Column<RecentPayment>[] = [
  {
    key: "id",
    header: "Payment",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-400">{r.id}</span>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (r) => <span className="text-zinc-200">{r.customer}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (r) => (
      <span className="font-medium text-white">{r.amount}</span>
    ),
  },
  {
    key: "chain",
    header: "Chain",
    render: (r) => <span className="text-zinc-300">{r.chain}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusPill variant={r.status} />,
  },
  {
    key: "date",
    header: "Date",
    align: "right",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-zinc-500">{r.date}</span>
    ),
  },
];

// 30 day mock volume series (in thousands of USD)
const volumeSeries = [
  3.1, 3.8, 4.2, 3.4, 5.1, 5.6, 4.8, 5.9, 6.2, 5.4, 6.8, 7.1, 6.4, 7.8, 8.2,
  7.6, 8.9, 9.4, 8.7, 9.9, 10.6, 9.8, 11.2, 11.9, 10.7, 12.4, 13.1, 12.6, 13.8,
  14.5,
];

function VolumeChart() {
  const w = 720;
  const h = 220;
  const padX = 28;
  const padY = 24;
  const max = Math.max(...volumeSeries);
  const min = Math.min(...volumeSeries);
  const range = max - min || 1;

  const points = volumeSeries.map((v, i) => {
    const x = padX + (i * (w - padX * 2)) / (volumeSeries.length - 1);
    const y = h - padY - ((v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1][0]} ${h - padY} L ${
    points[0][0]
  } ${h - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-label="Volume last 30 days chart"
    >
      <defs>
        <linearGradient id="vol-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="vol-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => {
        const y = padY + (h - padY * 2) * t;
        return (
          <line
            key={t}
            x1={padX}
            y1={y}
            x2={w - padX}
            y2={y}
            stroke="rgba(74,222,128,0.08)"
            strokeDasharray="2 6"
          />
        );
      })}

      <path d={areaPath} fill="url(#vol-area)" />
      <path
        d={path}
        fill="none"
        stroke="url(#vol-line)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map(([x, y], i) =>
        i === points.length - 1 ? (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#4ade80" fillOpacity="0.2" />
            <circle cx={x} cy={y} r="3" fill="#4ade80" />
          </g>
        ) : null
      )}
    </svg>
  );
}

const chains = [
  { name: "Base", pct: 42, color: "#4ade80" },
  { name: "Solana", pct: 28, color: "#86efac" },
  { name: "Polygon", pct: 18, color: "#22c55e" },
  { name: "Arbitrum", pct: 12, color: "#16a34a" },
];

function DonutChart() {
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Settlement chain breakdown"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(74,222,128,0.08)"
        strokeWidth={stroke}
      />
      {chains.map((ch) => {
        const dash = (ch.pct / 100) * c;
        const offset = c - acc;
        acc += dash;
        return (
          <circle
            key={ch.name}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={ch.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
      })}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        className="font-display"
        fill="#fff"
        fontSize="22"
        fontWeight="600"
      >
        100%
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        fill="#71717a"
        fontSize="10"
      >
        settled
      </text>
    </svg>
  );
}

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total volume"
          value="$128,420"
          delta="+12.4%"
          trend="up"
          hint="vs. previous 30 days"
        />
        <StatCard
          label="Successful payments"
          value="1,847"
          delta="+8.1%"
          trend="up"
          hint="98.2% success rate"
        />
        <StatCard
          label="Avg ticket"
          value="$69.52"
          delta="+2.7%"
          trend="up"
          hint="rolling 30 days"
        />
        <StatCard
          label="Pending payout"
          value="$4,210"
          delta="next: May 17"
          trend="flat"
          hint="across 4 chains"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Volume last 30 days
              </div>
              <div className="mt-1.5 flex items-baseline gap-3">
                <div className="font-display text-2xl font-semibold text-white">
                  $128,420
                </div>
                <span className="text-xs font-medium text-emerald-300">
                  +12.4%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                Settled USDC
              </span>
            </div>
          </div>
          <div className="mt-6 h-56">
            <VolumeChart />
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-zinc-600">
            <span>Apr 16</span>
            <span>Apr 30</span>
            <span>May 15</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(74,222,128,0.18)] bg-[#0c1310] p-6">
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            Settlement chains
          </div>
          <div className="mt-4 flex items-center justify-center">
            <DonutChart />
          </div>
          <ul className="mt-5 flex flex-col gap-2.5">
            {chains.map((ch) => (
              <li
                key={ch.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="inline-flex items-center gap-2.5 text-zinc-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  {ch.name}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {ch.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-white">
              Recent <span className="text-accent">payments</span>
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Last 5 settled transactions across all chains.
            </p>
          </div>
        </div>
        <DataTable
          columns={recentColumns}
          rows={recentPayments}
          rowKey={(r) => r.id}
        />
      </section>
    </div>
  );
}
