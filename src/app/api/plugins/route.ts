import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getBuiltinPlugins, loadPlugins } from "@/lib/plugins";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get("storeId");

    const where: Record<string, unknown> = {};
    if (storeId) where.storeId = storeId;
    else where.storeId = null;

    const plugins = await db.plugin.findMany({ where: where as any, orderBy: { name: "asc" } });

    const builtin = getBuiltinPlugins();
    const merged = builtin.map((b) => {
      const installed = plugins.find((p) => p.key === b.key);
      return {
        ...b,
        id: installed?.id || null,
        enabled: installed?.enabled ?? false,
        config: installed?.config ? JSON.parse(installed.config) : (b.defaultConfig || {}),
        installed: !!installed,
      };
    });

    const custom = plugins.filter((p) => !builtin.find((b) => b.key === p.key)).map((p) => ({
      key: p.key,
      name: p.name,
      description: p.description,
      version: p.version,
      id: p.id,
      enabled: p.enabled,
      config: JSON.parse(p.config),
      installed: true,
    }));

    return NextResponse.json({ plugins: [...merged, ...custom] });
  } catch (error) {
    console.error("Error fetching plugins:", error);
    return NextResponse.json({ error: "Failed to fetch plugins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { key, name, description, version, config, storeId } = body;

    if (!key || !name) {
      return NextResponse.json({ error: "Key and name are required" }, { status: 400 });
    }

    const existing = await db.plugin.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ error: "Plugin with this key already exists" }, { status: 409 });
    }

    const plugin = await db.plugin.create({
      data: {
        key,
        name,
        description: description || null,
        version: version || "1.0.0",
        config: JSON.stringify(config || {}),
        storeId: storeId || null,
        enabled: false,
      },
    });

    await loadPlugins();

    return NextResponse.json({ plugin });
  } catch (error) {
    console.error("Error creating plugin:", error);
    return NextResponse.json({ error: "Failed to create plugin" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { id, key, name, description, version, enabled, config } = body;

    if (!id && !key) {
      return NextResponse.json({ error: "Plugin ID or key is required" }, { status: 400 });
    }

    const where = id ? { id } : { key };
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (version !== undefined) updateData.version = version;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (config !== undefined) updateData.config = JSON.stringify(config);

    const plugin = await db.plugin.upsert({
      where: where as any,
      create: {
        key: key || "unknown",
        name: name || "Unknown Plugin",
        description: description || null,
        version: version || "1.0.0",
        config: JSON.stringify(config || {}),
        enabled: enabled || false,
      },
      update: updateData,
    });

    await loadPlugins();

    return NextResponse.json({ plugin });
  } catch (error) {
    console.error("Error updating plugin:", error);
    return NextResponse.json({ error: "Failed to update plugin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id, key } = await request.json();

    if (!id && !key) {
      return NextResponse.json({ error: "Plugin ID or key is required" }, { status: 400 });
    }

    const where = id ? { id } : { key };
    await db.plugin.delete({ where: where as any });

    await loadPlugins();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plugin:", error);
    return NextResponse.json({ error: "Failed to delete plugin" }, { status: 500 });
  }
}
