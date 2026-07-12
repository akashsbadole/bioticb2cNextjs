import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;

    const prices = await db.customerPrice.findMany({
      where: where as any,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Product: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Error fetching customer prices:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { productId, userId, price } = body;

    if (!productId || !userId || price === undefined) {
      return NextResponse.json({ error: "productId, userId, and price are required" }, { status: 400 });
    }

    const existing = await db.customerPrice.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    let result;
    if (existing) {
      result = await db.customerPrice.update({
        where: { id: existing.id },
        data: { price },
      });
    } else {
      result = await db.customerPrice.create({
        data: { productId, userId, price },
      });
    }

    return NextResponse.json({ price: result });
  } catch (error) {
    console.error("Error saving customer price:", error);
    return NextResponse.json({ error: "Failed to save price" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    await db.customerPrice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer price:", error);
    return NextResponse.json({ error: "Failed to delete price" }, { status: 500 });
  }
}
