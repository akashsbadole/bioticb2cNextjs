import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getPresetThemes } from "@/lib/themes";

const prisma = db as any;

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get("storeId");

    const where: Record<string, unknown> = {};
    if (storeId) where.storeId = storeId;
    else where.storeId = null;

    const themes = await prisma.theme.findMany({
      where: where as any,
      orderBy: { name: "asc" },
    });

    const presets = getPresetThemes();
    const merged = Object.entries(presets).map(([slug, config]) => {
      const installed = themes.find((t) => t.slug === slug);
      return {
        id: installed?.id || null,
        slug,
        name: config.name,
        description: installed?.description || null,
        isActive: installed?.isActive ?? false,
        config: installed?.config ? JSON.parse(installed.config) : config,
        installed: !!installed,
      };
    });

    // Include custom themes
    const custom = themes
      .filter((t) => !presets[t.slug])
      .map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        isActive: t.isActive,
        config: JSON.parse(t.config),
        installed: true,
      }));

    return NextResponse.json({ themes: [...merged, ...custom] });
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { slug, name, description, config, storeId, activate } = body;

    if (!slug || !name || !config) {
      return NextResponse.json(
        { error: "Slug, name, and config are required" },
        { status: 400 },
      );
    }

    if (body.activate) {
      await prisma.theme.updateMany({
        where: { storeId: storeId || null, isActive: true },
        data: { isActive: false },
      });
    }

    const theme = await prisma.theme.upsert({
      where: { slug },
      create: {
        slug,
        name,
        description: description || null,
        config: JSON.stringify(config),
        storeId: storeId || null,
        isActive: body.activate || false,
      },
      update: {
        name,
        description: description || null,
        config: JSON.stringify(config),
        isActive: body.activate || false,
      },
    });

    if (body.activate) {
      const existingSetting = await prisma.siteSetting.findFirst({
        where: { key: "active_theme", storeId: storeId || null },
      });
      if (existingSetting) {
        await prisma.siteSetting.update({
          where: { id: existingSetting.id },
          data: { value: JSON.stringify(config) },
        });
      } else {
        await prisma.siteSetting.create({
          data: {
            storeId: storeId || null,
            key: "active_theme",
            value: JSON.stringify(config),
          },
        });
      }
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Error saving theme:", error);
    return NextResponse.json(
      { error: "Failed to save theme" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { themeId, activate } = body;

    if (!themeId) {
      return NextResponse.json(
        { error: "Theme ID is required" },
        { status: 400 },
      );
    }

    if (activate) {
      const theme = await prisma.theme.findUnique({ where: { id: themeId } });
      if (!theme) {
        return NextResponse.json({ error: "Theme not found" }, { status: 404 });
      }

      await prisma.theme.updateMany({
        where: { storeId: theme.storeId, isActive: true },
        data: { isActive: false },
      });

      await prisma.theme.update({
        where: { id: themeId },
        data: { isActive: true },
      });

      const existingSetting = await prisma.siteSetting.findFirst({
        where: { key: "active_theme", storeId: theme.storeId },
      });
      if (existingSetting) {
        await prisma.siteSetting.update({
          where: { id: existingSetting.id },
          data: { value: theme.config },
        });
      } else {
        await prisma.siteSetting.create({
          data: {
            storeId: theme.storeId,
            key: "active_theme",
            value: theme.config,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error activating theme:", error);
    return NextResponse.json(
      { error: "Failed to activate theme" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Theme ID is required" },
        { status: 400 },
      );
    }

    await prisma.theme.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 },
    );
  }
}
