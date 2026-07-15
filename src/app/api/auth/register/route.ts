import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createUser } from "@/lib/auth";
import { createToken } from "@/lib/jwt-helper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, companyName, taxId, address } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser({ name, email: normalized, password, phone: phone || null });

    // Update standard B2C registration optional fields
    if (companyName || taxId || address) {
      const docs = JSON.stringify({ companyName, taxId, address });
      await db.user.update({
        where: { id: user.id },
        data: { documents: docs },
      });
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
