/**
 * GET /api/invoices/[id]  Fetch a single invoice
 */

import { NextResponse, type NextRequest } from "next/server";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = await storage.invoices.get(id);
  if (!invoice) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}
