import { NextResponse } from "next/server";
import { availableAuthMethods } from "@/auth";

export const runtime = "nodejs";

/** Lets the client decide which auth buttons to show. */
export async function GET() {
  return NextResponse.json(availableAuthMethods());
}
