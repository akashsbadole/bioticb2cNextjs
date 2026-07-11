import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Internal endpoint used by the middleware (Edge runtime) to resolve the
// single default store ID. Protected so it can only be called by the app itself.
export async function GET(request: NextRequest) {
  if (request.headers.get("x-internal-request") !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const slug = process.env.DEFAULT_STORE_SLUG || "main";
  const store = await db.store.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Default store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}
