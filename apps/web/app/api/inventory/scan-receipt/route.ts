import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "../../../_lib/auth";

// ─── POST /api/inventory/scan-receipt ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiptId } = await request.json();
    if (!receiptId) {
      return NextResponse.json({ error: "Thiếu mã hóa đơn (receiptId)" }, { status: 400 });
    }

    // ── Mock database thực phẩm siêu thị ──
    const MOCK_PRODUCTS = [
      { name: "Thịt heo xay",          barcode: "8935049501237", category: "other",   location: "fridge",  daysAfterOpen: 2,   shelfLifeDays: 5,   price: 65000 },
      { name: "Sữa tươi TH True Milk", barcode: "8935217400150", category: "milk",    location: "fridge",  daysAfterOpen: 5,   shelfLifeDays: 45,  price: 32000 },
      { name: "Rau cải bó xôi",        barcode: "8938503221014", category: "other",   location: "fridge",  daysAfterOpen: 3,   shelfLifeDays: 7,   price: 18000 },
      { name: "Xúc xích Đức Việt",     barcode: "8936006760017", category: "sausage", location: "fridge",  daysAfterOpen: 7,   shelfLifeDays: 90,  price: 45000 },
      { name: "Tương ớt Chinsu",        barcode: "8934804001012", category: "sauce",   location: "room",    daysAfterOpen: 30,  shelfLifeDays: 365, price: 22000 },
      { name: "Nước cam Tropicana",     barcode: "8934680033213", category: "drink",   location: "fridge",  daysAfterOpen: 5,   shelfLifeDays: 120, price: 38000 },
      { name: "Cá hồi phi lê",         barcode: "8936190991234", category: "other",   location: "freezer", daysAfterOpen: 2,   shelfLifeDays: 14,  price: 120000 },
      { name: "Phô mai Con Bò Cười",   barcode: "8934680011419", category: "milk",    location: "fridge",  daysAfterOpen: 14,  shelfLifeDays: 180, price: 55000 },
      { name: "Đậu hũ non Vinasoy",    barcode: "8934561088018", category: "other",   location: "fridge",  daysAfterOpen: 2,   shelfLifeDays: 30,  price: 12000 },
      { name: "Nước mắm Phú Quốc",     barcode: "8936007000082", category: "sauce",   location: "room",    daysAfterOpen: 180, shelfLifeDays: 730, price: 42000 },
    ];

    const seed = receiptId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const count = 3 + (seed % 3);
    const shuffled = [...MOCK_PRODUCTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const now = new Date();
    const items = selected.map((p, i) => {
      const mfgDaysAgo = 1 + ((seed + i) % 14);
      const manufacturingDate = new Date(now.getTime() - mfgDaysAgo * 86400000);
      const exactExpiryDate = new Date(manufacturingDate.getTime() + p.shelfLifeDays * 86400000);

      return {
        tempId: `receipt-${receiptId}-${i}`,
        name: p.name,
        barcode: p.barcode,
        category: p.category,
        storageLocation: p.location,
        quantity: 1,
        price: p.price,
        daysAfterOpen: p.daysAfterOpen,
        manufacturingDate: manufacturingDate.toISOString().split("T")[0],
        suggestedOpenedAt: now.toISOString().split("T")[0],
        suggestedExpiryDate: exactExpiryDate.toISOString().split("T")[0],
        expirySource: "manufacturer" as const,
      };
    });

    const totalPrice = items.reduce((sum, item) => sum + (item.price ?? 0), 0);

    return NextResponse.json({
      data: {
        receiptId,
        storeName: receiptId.startsWith("COOP") ? "Co.op Mart" :
                   receiptId.startsWith("BACH") ? "Bách Hóa Xanh" :
                   receiptId.startsWith("WIN")  ? "WinMart" : "Siêu thị",
        scannedAt: now.toISOString(),
        totalPrice,
        items,
      },
    });
  } catch (error) {
    console.error("[POST /api/inventory/scan-receipt]", error);
    return NextResponse.json({ error: "Lỗi xử lý hóa đơn" }, { status: 500 });
  }
}
