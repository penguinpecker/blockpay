/**
 * PATCH  /api/payment-links/[id]   Toggle a link's active flag
 * DELETE /api/payment-links/[id]   Delete a link (only allowed when no
 *                                  payments have been received yet)
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadOwnedLink(linkId: string, userId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) return { error: "no_merchant" as const, status: 404 };
  const link = await prisma.paymentLink.findUnique({ where: { id: linkId } });
  if (!link || link.merchantId !== merchant.id) {
    return { error: "not_found" as const, status: 404 };
  }
  return { link, merchant };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const owned = await loadOwnedLink(id, session.user.id as string);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  let body: { active?: boolean };
  try {
    body = (await req.json()) as { active?: boolean };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data: { active?: boolean } = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const updated = await prisma.paymentLink.update({
    where: { id: owned.link.id },
    data,
  });
  return NextResponse.json({ link: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const owned = await loadOwnedLink(id, session.user.id as string);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }
  if (owned.link.paymentCount > 0) {
    return NextResponse.json(
      { error: "has_payments", message: "Archive instead — this link has payments attached." },
      { status: 409 },
    );
  }
  await prisma.paymentLink.delete({ where: { id: owned.link.id } });
  return NextResponse.json({ ok: true });
}
