import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await requireAdminAuth(_request);
  if (!auth.success) return auth.response;

  try {
    const theme = await db.theme.findUnique({ where: { slug } });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json({
      theme: {
        ...theme,
        config: JSON.parse(theme.config),
      },
    });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}
