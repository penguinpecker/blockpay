import { headers } from "next/headers";
import { Link2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import { prisma } from "@/lib/prisma";
import { LinksClient, type LinkRow } from "./links-client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ new?: string }>;

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  if (host) return `${protocol}://${host}`;
  return "https://blockpay-six.vercel.app";
}

export default async function PaymentLinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { merchant } = await requireMerchant("/dashboard/links");
  const sp = await searchParams;
  const openForm = sp.new === "1";

  const links = await prisma.paymentLink.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  const origin = await resolveOrigin();

  const rows: LinkRow[] = links.map((l) => ({
    id: l.id,
    slug: l.slug,
    label: l.label,
    amount: l.amount,
    currency: l.currency,
    chainKey: l.chainKey,
    description: l.description,
    active: l.active,
    paymentCount: l.paymentCount,
    url: `${origin}/pay/${l.slug}`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment links"
        description="Shareable, reusable links that route a customer straight to checkout."
      />

      <LinksClient
        initialRows={rows}
        initialOpen={openForm}
        defaultChainKey={merchant.settlementChainKey}
        defaultCurrency={merchant.settlementCurrency}
        origin={origin}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No payment links yet"
          body="Spin up your first link, share the URL anywhere, and we route the customer straight to checkout."
        />
      ) : null}
    </div>
  );
}
