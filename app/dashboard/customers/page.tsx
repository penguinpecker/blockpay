import { DataTable, type Column } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";

type Customer = {
  id: string;
  name: string;
  handle: string;
  ltv: string;
  lastPayment: string;
};

const customers: Customer[] = [
  {
    id: "cus_001",
    name: "Lena Park",
    handle: "lena@northwave.io",
    ltv: "$4,820.00",
    lastPayment: "May 15, 2026",
  },
  {
    id: "cus_002",
    name: "Rio Vance",
    handle: "rio.eth",
    ltv: "$2,640.20",
    lastPayment: "May 15, 2026",
  },
  {
    id: "cus_003",
    name: "Parallax Studios",
    handle: "studios@parallax.xyz",
    ltv: "$12,890.00",
    lastPayment: "May 15, 2026",
  },
  {
    id: "cus_004",
    name: "Mark Ellison",
    handle: "mark@goodmail.com",
    ltv: "$312.00",
    lastPayment: "May 14, 2026",
  },
  {
    id: "cus_005",
    name: "Ana Bardem",
    handle: "ana@northwave.io",
    ltv: "$1,058.00",
    lastPayment: "May 14, 2026",
  },
  {
    id: "cus_006",
    name: "Longtail Records",
    handle: "vendor@longtail.co",
    ltv: "$6,310.40",
    lastPayment: "May 14, 2026",
  },
  {
    id: "cus_007",
    name: "Candlebox EU",
    handle: "support@candlebox.eu",
    ltv: "$3,420.00",
    lastPayment: "May 14, 2026",
  },
  {
    id: "cus_008",
    name: "Rinka",
    handle: "rinka.sol",
    ltv: "$842.40",
    lastPayment: "May 13, 2026",
  },
  {
    id: "cus_009",
    name: "Bridge42",
    handle: "ops@bridge42.io",
    ltv: "$18,204.00",
    lastPayment: "May 13, 2026",
  },
  {
    id: "cus_010",
    name: "Alex Rune",
    handle: "alex.eth",
    ltv: "$496.00",
    lastPayment: "May 13, 2026",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(74,222,128,0.12)] font-display text-xs font-bold text-[#4ade80]">
          {initials(r.name)}
        </div>
        <span className="font-medium text-white">{r.name}</span>
      </div>
    ),
  },
  {
    key: "handle",
    header: "Email or handle",
    render: (r) => (
      <span className="font-mono text-xs text-zinc-400">{r.handle}</span>
    ),
  },
  {
    key: "ltv",
    header: "Lifetime value",
    align: "right",
    render: (r) => <span className="font-medium text-white">{r.ltv}</span>,
  },
  {
    key: "lastPayment",
    header: "Last payment",
    align: "right",
    render: (r) => (
      <span className="whitespace-nowrap text-xs text-zinc-400">
        {r.lastPayment}
      </span>
    ),
  },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone who has ever paid through your account. Sorted by most recent activity."
      />
      <DataTable columns={columns} rows={customers} rowKey={(r) => r.id} />
    </div>
  );
}
