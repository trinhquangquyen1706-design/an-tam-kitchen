import { NextRequest, NextResponse } from "next/server";
import { inventory, products } from "@/lib/api-server/store";
import { getCurrentUserId } from "@/lib/api-server/auth";

function enrichWithProduct(item: (typeof inventory)[0]) {
  const product = products.find((p) => p.id === item.userProductId);
  return { ...item, product: product ?? undefined };
}

// ─── GET /api/inventory — list all items for current user ───────────────────
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = inventory
      .filter((i) => i.userId === userId)
      .map(enrichWithProduct);

    return NextResponse.json({ data: items, count: items.length });
  } catch (error) {
    console.error("[GET /api/inventory]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/inventory — create new item ──────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let productId = body.productId;

    // Smart Create: create product on-the-fly
    if (!productId && body.name && body.category) {
      const newProduct = {
        id: crypto.randomUUID(),
        name: body.name,
        category: body.category,
        company: "Unknown",
        daysBeforeOpen: 30,
        daysAfterOpen: 7,
        isGlobal: false,
        ownerId: userId,
      };
      products.push(newProduct);
      productId = newProduct.id;
    }

    if (!productId) {
      return NextResponse.json({ error: "Không thể xác định Product ID" }, { status: 400 });
    }

    const location = body.location || body.storageLocation || "fridge";
    const expiryDate = body.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date();

    const newItem = {
      id: crypto.randomUUID(),
      userId,
      userProductId: productId,
      displayName: body.displayName || body.name || "Sản phẩm mới",
      openedAt: body.openedAt || null,
      expiryDate,
      location,
      status: body.status || "fresh",
      notes: body.notes || null,
      quantity: body.quantity || null,
      createdAt: now,
      updatedAt: now,
    };

    inventory.push(newItem);

    return NextResponse.json({ data: enrichWithProduct(newItem) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/inventory]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
