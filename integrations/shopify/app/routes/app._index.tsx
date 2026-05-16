import { useEffect, useMemo, useState } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Box,
  Button,
  Card,
  InlineStack,
  Layout,
  Link,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

type ChainOption = "arc-testnet" | "base-sepolia";

const CHAIN_OPTIONS: { label: string; value: ChainOption }[] = [
  { label: "Arc Testnet", value: "arc-testnet" },
  { label: "Base Sepolia", value: "base-sepolia" },
];

const BLOCKPAY_APP_URL =
  process.env.BLOCKPAY_APP_URL || "https://blockpay-six.vercel.app";

function slugifyShop(shop: string): string {
  return shop.replace(/\.myshopify\.com$/i, "").toLowerCase();
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const settings = await prisma.merchantSettings.findUnique({
    where: { shop: session.shop },
  });

  return {
    shop: session.shop,
    settings: settings
      ? {
          settlementAddress: settings.settlementAddress ?? "",
          settlementChain: (settings.settlementChain as ChainOption) ?? "arc-testnet",
          merchantSlug: settings.merchantSlug ?? slugifyShop(session.shop),
        }
      : {
          settlementAddress: "",
          settlementChain: "arc-testnet" as ChainOption,
          merchantSlug: slugifyShop(session.shop),
        },
    blockpayAppUrl: BLOCKPAY_APP_URL,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // The form posts to /api/settings; this action is kept for completeness if
  // the page is ever wired to post here directly.
  await authenticate.admin(request);

  return { ok: true };
};

export default function Index() {
  const { shop, settings, blockpayAppUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ ok?: boolean; error?: string }>();
  const submit = useSubmit();

  const [settlementAddress, setSettlementAddress] = useState(
    settings.settlementAddress,
  );
  const [settlementChain, setSettlementChain] = useState<ChainOption>(
    settings.settlementChain,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [showSavedNotice, setShowSavedNotice] = useState(false);

  const addressValid = useMemo(() => {
    if (!settlementAddress) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(settlementAddress.trim());
  }, [settlementAddress]);

  useEffect(() => {
    if (actionData?.ok) {
      setShowSavedNotice(true);
      setIsSaving(false);
      const t = setTimeout(() => setShowSavedNotice(false), 4000);
      return () => clearTimeout(t);
    }
  }, [actionData]);

  const previewLink = `${blockpayAppUrl}/pay/${settings.merchantSlug}?source=shopify&shop=${encodeURIComponent(
    shop,
  )}`;

  const handleSave = () => {
    if (!addressValid) return;
    setIsSaving(true);
    const formData = new FormData();
    formData.set("settlementAddress", settlementAddress.trim());
    formData.set("settlementChain", settlementChain);
    submit(formData, { method: "post", action: "/api/settings" });
  };

  return (
    <Page
      title="BlockPay settings"
      subtitle="Connect your settlement wallet to accept USDC payments on your storefront."
    >
      <Layout>
        {bannerVisible && (
          <Layout.Section>
            <Banner
              title="BlockPay is in testnet"
              tone="info"
              onDismiss={() => setBannerVisible(false)}
            >
              <p>
                Connect your settlement wallet below to start accepting USDC. The
                v0 integration redirects shoppers to{" "}
                <Link url={blockpayAppUrl} target="_blank">
                  BlockPay-hosted checkout
                </Link>
                . A native Shopify Payments App integration is in review.
              </p>
            </Banner>
          </Layout.Section>
        )}

        {showSavedNotice && (
          <Layout.Section>
            <Banner title="Settings saved" tone="success" onDismiss={() => setShowSavedNotice(false)} />
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner title="Save failed" tone="critical">
              <p>{actionData.error}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="space-between">
                <Text as="h2" variant="headingMd">
                  Settlement configuration
                </Text>
                <Badge tone={addressValid ? "success" : "attention"}>
                  {addressValid ? "Connected" : "Not connected"}
                </Badge>
              </InlineStack>

              <TextField
                label="Settlement wallet address"
                value={settlementAddress}
                onChange={setSettlementAddress}
                placeholder="0x0000000000000000000000000000000000000000"
                helpText="USDC received via BlockPay will be paid out to this address. Must be a valid 0x EVM address."
                autoComplete="off"
                error={
                  settlementAddress && !addressValid
                    ? "Enter a valid 0x EVM address (42 chars)."
                    : undefined
                }
              />

              <Select
                label="Settlement chain"
                options={CHAIN_OPTIONS}
                value={settlementChain}
                onChange={(value) => setSettlementChain(value as ChainOption)}
                helpText="Mainnet support unlocks after Shopify Payments App approval."
              />

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={!addressValid}
                >
                  Save settings
                </Button>
                <Button url={previewLink} target="_blank">
                  Preview hosted checkout
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                How it works
              </Text>
              <Text as="p" tone="subdued">
                1. Save your settlement wallet address and chain.
              </Text>
              <Text as="p" tone="subdued">
                2. Add the &ldquo;Pay with crypto via BlockPay&rdquo; block to your
                cart page from Online Store &gt; Themes.
              </Text>
              <Text as="p" tone="subdued">
                3. Shoppers click the block and are redirected to BlockPay-hosted
                checkout to pay in USDC.
              </Text>
              <Box paddingBlockStart="200">
                <Link url={`${blockpayAppUrl}/docs`} target="_blank">
                  Read the BlockPay docs
                </Link>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
