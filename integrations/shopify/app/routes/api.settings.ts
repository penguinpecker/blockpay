import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const ALLOWED_CHAINS = new Set(["arc-testnet", "base-sepolia"]);

function isValidEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function slugifyShop(shop: string): string {
  return shop.replace(/\.myshopify\.com$/i, "").toLowerCase();
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const settings = await prisma.merchantSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({
    shop: session.shop,
    settings,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();
  const settlementAddress = String(form.get("settlementAddress") || "").trim();
  const settlementChain = String(form.get("settlementChain") || "").trim();

  if (!isValidEvmAddress(settlementAddress)) {
    return json(
      { ok: false, error: "Invalid settlement address" },
      { status: 400 },
    );
  }

  if (!ALLOWED_CHAINS.has(settlementChain)) {
    return json(
      { ok: false, error: "Unsupported settlement chain" },
      { status: 400 },
    );
  }

  const merchantSlug = slugifyShop(session.shop);

  const saved = await prisma.merchantSettings.upsert({
    where: { shop: session.shop },
    update: {
      settlementAddress,
      settlementChain,
      merchantSlug,
    },
    create: {
      shop: session.shop,
      settlementAddress,
      settlementChain,
      merchantSlug,
    },
  });

  return json({ ok: true, settings: saved });
};
