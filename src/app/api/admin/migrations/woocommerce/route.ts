import { NextRequest, NextResponse } from "next/server";
import { migrateWooCommerceProducts, migrateWooCommerceOrders, migrateWooCommerceUsers, migrateWooCommerceCategories } from "@/lib/migrations/woocommerce";
import { getStoreId } from "@/lib/store-db";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const { type, data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let result;
    if (type === "products") {
      result = await migrateWooCommerceProducts(data, storeId);
    } else if (type === "orders") {
      result = await migrateWooCommerceOrders(data, storeId);
    } else if (type === "users") {
      result = await migrateWooCommerceUsers(data, storeId);
    } else if (type === "categories") {
      result = await migrateWooCommerceCategories(data, storeId);
    } else {
      return NextResponse.json({ error: "Invalid migration type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
