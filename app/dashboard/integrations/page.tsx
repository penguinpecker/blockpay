import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import { formatLongDate } from "@/components/dashboard/format";
import { IntegrationsClient } from "./integrations-client";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const { merchant } = await requireMerchant("/dashboard/integrations");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Integrations"
        description="API keys, webhooks, and platform snippets to plug BlockPay into your stack."
      />

      <IntegrationsClient
        apiKeyIssued={merchant.apiKeyHash !== null}
        apiKeyIssuedAt={formatLongDate(merchant.createdAt)}
        webhookUrl={merchant.webhookUrl ?? ""}
        webhookSecretSet={Boolean(merchant.webhookSecret)}
        merchantAddress={merchant.settlementAddress}
      />
    </div>
  );
}
