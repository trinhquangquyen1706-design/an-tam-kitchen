import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api-server/auth";

// ─── POST /api/user-products — create user product ──────────────────────────
// This is a secondary endpoint called alongside inventory creation.
// For the serverless demo, we just acknowledge it since the product
// is already created inline by the inventory route.
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Return a valid user-product response
    const userProduct = {
      id: crypto.randomUUID(),
      userId,
      name: body.name || "Unknown",
      category: body.category || "other",
      storageLocation: body.storageLocation || "fridge",
      note: body.note || null,
      company: "Unknown",
      barcode: null,
      imageUrl: null,
      daysBeforeOpen: 30,
      daysAfterOpen: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: userProduct }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/user-products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/user-products — list user products ────────────────────────────
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ data: [], count: 0 });
  } catch (error) {
    console.error("[GET /api/user-products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
