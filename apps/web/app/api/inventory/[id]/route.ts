import { NextRequest, NextResponse } from "next/server";
import { inventory, products } from "../../../_lib/store";
import { getCurrentUserId } from "../../../_lib/auth";

function enrichWithProduct(item: (typeof inventory)[0]) {
  const product = products.find((p) => p.id === item.userProductId);
  return { ...item, product: product ?? undefined };
}

// ─── GET /api/inventory/[id] ────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = inventory.find((i) => i.id === id);

    if (!item) {
      return NextResponse.json({ error: `Không tìm thấy vật phẩm với id: ${id}` }, { status: 404 });
    }

    if (item.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: enrichWithProduct(item) });
  } catch (error) {
    console.error("[GET /api/inventory/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/inventory/[id] ─────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const index = inventory.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (inventory[index].userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    inventory.splice(index, 1);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/inventory/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
