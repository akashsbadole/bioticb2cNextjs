import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const prices = await db.customerPrice.findMany({
      where: { userId: auth.payload.userId },
    });

    const priceMap: Record<string, number> = {};
    for (const p of prices) {
      priceMap[p.productId] = p.price;
    }

    return NextResponse.json({ prices: priceMap });
  } catch (error) {
    console.error("Get customer prices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
