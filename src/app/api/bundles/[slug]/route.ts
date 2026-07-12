import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const bundle = await db.bundle.findUnique({
      where: { slug },
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
                comparePrice: true,
                shortDescription: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!bundle || !bundle.isActive) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json({ error: "Failed to fetch bundle" }, { status: 500 });
  }
}
