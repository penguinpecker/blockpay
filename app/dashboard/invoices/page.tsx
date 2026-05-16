import { FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import {
  chainName,
  formatAmount,
  formatLongDate,
  truncateAddress,
} from "@/components/dashboard/format";
import { prisma } from "@/lib/prisma";
import { InvoicesClient, type InvoiceRow } from "./invoices-client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ new?: string }>;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { merchant } = await requireMerchant("/dashboard/invoices");
  const sp = await searchParams;
  const openForm = sp.new === "1";

  const invoices = await prisma.invoice.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: InvoiceRow[] = invoices.map((inv) => ({
    id: inv.id,
    number: inv.id.slice(0, 12),
    customer: truncateAddress(inv.merchantAddress),
    amount: formatAmount(inv.amount, inv.currency),
    status: inv.status,
    chain: chainName(inv.chainKey),
    due: inv.expiresAt ? formatLongDate(inv.expiresAt) : "—",
    createdAt: formatLongDate(inv.createdAt),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Send a payable link to any customer, get notified the moment they settle."
      />

      <InvoicesClient
        merchantId={merchant.id}
        merchantAddress={merchant.settlementAddress}
        defaultChainKey={merchant.settlementChainKey}
        defaultCurrency={merchant.settlementCurrency}
        initialOpen={openForm}
        initialRows={rows}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          body="Create your first invoice and share the checkout link. As soon as the customer pays, the invoice flips to paid here."
        />
      ) : null}
    </div>
  );
}
