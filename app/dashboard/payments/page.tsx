import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  PaymentsTable,
  type PaymentRow,
} from "@/components/dashboard/payments-table";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import {
  chainName,
  formatAmount,
  formatShortDateTime,
  truncateAddress,
  truncateHash,
} from "@/components/dashboard/format";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const { merchant } = await requireMerchant("/dashboard/payments");
  const settlementAddressLower = merchant.settlementAddress.toLowerCase();

  const payments = await prisma.payment.findMany({
    where: { merchantAddress: settlementAddressLower },
    orderBy: { blockTimestamp: "desc" },
    take: 200,
  });

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    date: formatShortDateTime(p.blockTimestamp),
    status: "success",
    customer: truncateAddress(p.payer),
    amount: formatAmount(p.amount, merchant.settlementCurrency),
    chain: chainName(p.chainKey),
    tx: truncateHash(p.txHash),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Every on-chain payment that has settled to your account."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          body="When customers settle an invoice or checkout link, every transaction lands here in real time."
          cta={{ label: "Create an invoice", href: "/dashboard/invoices" }}
        />
      ) : (
        <PaymentsTable rows={rows} />
      )}
    </div>
  );
}
