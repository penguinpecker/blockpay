/**
 * POST /api/indexer/run
 *
 * Manually trigger the on-chain indexer. Used by the dashboard to refresh
 * the payments view. Gated by `INDEXER_AUTH_TOKEN` in production; in
 * development the gate is open so local smoke tests work without extra
 * config.
 */

import { NextResponse, type NextRequest } from "next/server";
import { indexAll } from "@/lib/server-indexer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const configuredToken = process.env.INDEXER_AUTH_TOKEN;
  const isDev = process.env.NODE_ENV === "development";

  if (!configuredToken && !isDev) {
    return NextResponse.json(
      { error: "indexer_not_configured" },
      { status: 503 },
    );
  }

  if (configuredToken) {
    const provided =
      req.headers.get("x-indexer-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (provided !== configuredToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const results = await indexAll();
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ error: "indexer_failed" }, { status: 500 });
  }
}
