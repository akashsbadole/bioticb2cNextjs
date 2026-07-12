import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getStoreId } from "@/lib/store-db";

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const searchParams = request.nextUrl.searchParams;
    const admin = searchParams.get("admin") === "true";

    if (admin) {
      const auth = await requireAdminAuth(request);
      if (!auth.success) return auth.response;
    }

    const where: Record<string, unknown> = { isActive: true };
    if (storeId) where.storeId = storeId;

    const bundles = await db.bundle.findMany({
      where: where as any,
      include: {
        items: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, slug, description, price, image, isActive, productIds, quantities } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: "Name, slug, and price are required" }, { status: 400 });
    }

    const bundle = await db.bundle.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        image: image || null,
        isActive: isActive ?? true,
        items: {
          create: (productIds || []).map((productId: string, idx: number) => ({
            productId,
            quantity: quantities?.[idx] || 1,
          })),
        },
      },
      include: {
        items: {
          include: { Product: { select: { id: true, name: true, price: true } } },
        },
      },
    });

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error("Error creating bundle:", error);
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { id, name, slug, description, price, image, isActive, productIds, quantities } = body;

    if (!id) {
      return NextResponse.json({ error: "Bundle ID is required" }, { status: 400 });
    }

    // Update bundle
    const bundle = await db.bundle.update({
      where: { id },
      data: {
        name: name ?? undefined,
        slug: slug ?? undefined,
        description: description !== undefined ? description : undefined,
        price: price ?? undefined,
        image: image !== undefined ? image : undefined,
        isActive: isActive ?? undefined,
      },
    });

    // Replace items if provided
    if (productIds) {
      await db.bundleItem.deleteMany({ where: { bundleId: id } });
      await db.bundleItem.createMany({
        data: productIds.map((productId: string, idx: number) => ({
          bundleId: id,
          productId,
          quantity: quantities?.[idx] || 1,
        })),
      });
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error("Error updating bundle:", error);
    return NextResponse.json({ error: "Failed to update bundle" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Bundle ID is required" }, { status: 400 });
    }

    await db.bundle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json({ error: "Failed to delete bundle" }, { status: 500 });
  }
}
