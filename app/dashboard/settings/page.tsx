import { PageHeader } from "@/components/dashboard/page-header";
import { requireMerchant } from "@/components/dashboard/require-merchant";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId, merchant } = await requireMerchant("/dashboard/settings");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, walletAddress: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Account, brand, settlement, tax, and webhook configuration."
      />

      <SettingsClient
        initial={{
          businessName: merchant.businessName,
          email: user?.email ?? "",
          walletAddress: user?.walletAddress ?? "",
          settlementAddress: merchant.settlementAddress,
          settlementChainKey: merchant.settlementChainKey,
          settlementCurrency: merchant.settlementCurrency,
          webhookUrl: merchant.webhookUrl ?? "",
        }}
      />
    </div>
  );
}
