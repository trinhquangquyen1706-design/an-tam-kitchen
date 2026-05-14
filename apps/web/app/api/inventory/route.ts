import { NextRequest, NextResponse } from "next/server";
import { inventory, products } from "@/lib/api-server/store";
import { getCurrentUserId, getCurrentTokenPayload } from "@/lib/api-server/auth";

function enrichWithProduct(item: (typeof inventory)[0]) {
  const product = products.find((p) => p.id === item.userProductId);
  return { ...item, product: product ?? undefined };
}

/**
 * Seed demo data for guest users on-the-fly.
 * On Vercel serverless, each request can hit a different instance,
 * so in-memory data from the guest login request may be lost.
 * This ensures guests always see demo data.
 */
function seedGuestDataIfNeeded(userId: string) {
  // Check if this user already has items in this instance
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

// ─── GET /api/inventory — list all items for current user ───────────────────
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto-seed demo data for guest users on cold starts
    const tokenPayload = await getCurrentTokenPayload();
    if (tokenPayload?.isGuest) {
      seedGuestDataIfNeeded(userId);
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
