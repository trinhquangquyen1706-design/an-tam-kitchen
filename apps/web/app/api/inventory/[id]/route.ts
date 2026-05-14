import { NextRequest, NextResponse } from "next/server";
import { inventory, products } from "@/lib/api-server/store";
import { getCurrentUserId, getCurrentTokenPayload } from "@/lib/api-server/auth";

function enrichWithProduct(item: (typeof inventory)[0]) {
  const product = products.find((p) => p.id === item.userProductId);
  return { ...item, product: product ?? undefined };
}

/**
 * Seed demo data for guest users (same logic as list route).
 * Ensures detail lookups work even on cold-start instances.
 */
function seedGuestDataIfNeeded(userId: string) {
  const existing = inventory.filter((i) => i.userId === userId);
  if (existing.length > 0) return;

  const now = new Date();
  const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  const demoProducts = [
    { id: crypto.randomUUID(), name: "Sữa tươi", category: "dairy", company: "An Tam Demo", daysBeforeOpen: 7, daysAfterOpen: 5, isGlobal: false, ownerId: userId },
    { id: crypto.randomUUID(), name: "Tương cà", category: "sauces_spices", company: "An Tam Demo", daysBeforeOpen: 180, daysAfterOpen: 30, isGlobal: false, ownerId: userId },
    { id: crypto.randomUUID(), name: "Xúc xích", category: "meat_poultry", company: "An Tam Demo", daysBeforeOpen: 10, daysAfterOpen: 4, isGlobal: false, ownerId: userId },
  ];

  demoProducts.forEach((p) => products.push(p));

  const demoItems = [
    { userId, userProductId: demoProducts[0].id, displayName: "Sữa tươi", openedAt: subDays(now, 4), expiryDate: addDays(now, 2), location: "fridge", status: "use_soon", notes: "Dùng cho bữa sáng hoặc pha cà phê.", quantity: "1 hộp" },
    { userId, userProductId: demoProducts[1].id, displayName: "Tương cà", openedAt: subDays(now, 4), expiryDate: addDays(now, 18), location: "room_temp", status: "fresh", notes: "Để ở kệ gia vị sau khi dùng.", quantity: "1 chai" },
    { userId, userProductId: demoProducts[2].id, displayName: "Xúc xích", openedAt: subDays(now, 5), expiryDate: addDays(now, 1), location: "fridge", status: "check_before_use", notes: "Đã mở gói, nên xem lại trước khi chế biến.", quantity: "300g" },
  ];

  demoItems.forEach((item) => {
    inventory.push({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  });
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

    // Auto-seed for guest users on cold starts
    const tokenPayload = await getCurrentTokenPayload();
    if (tokenPayload?.isGuest) {
      seedGuestDataIfNeeded(userId);
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
