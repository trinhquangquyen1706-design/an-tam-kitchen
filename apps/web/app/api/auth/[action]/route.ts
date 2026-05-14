import { NextRequest, NextResponse } from "next/server";
import { users, products, inventory } from "@/lib/api-server/store";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUserId,
} from "@/lib/api-server/auth";

// ─── POST /api/auth/signup ──────────────────────────────────────────────────
async function handleSignup(body: Record<string, unknown>) {
  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return NextResponse.json({ error: "Signup failed. User may already exist." }, { status: 400 });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name: name || null,
    password: hashPassword(password),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(newUser);

  const token = createAccessToken(newUser.id);
  await setAuthCookie(token);

  return NextResponse.json({
    message: "User created successfully",
    userId: newUser.id,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  }, { status: 201 });
}

// ─── POST /api/auth/login ───────────────────────────────────────────────────
async function handleLogin(body: Record<string, unknown>) {
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAccessToken(user.id);
  await setAuthCookie(token);

  return NextResponse.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email },
  });
}

// ─── POST /api/auth/guest ───────────────────────────────────────────────────
async function handleGuestLogin() {
  const guestId = Math.random().toString(36).substring(7);
  const guestEmail = `guest_${guestId}@beptantam.vn`;
  const guestName = `Khách ${guestId}`;

  const user = {
    id: crypto.randomUUID(),
    email: guestEmail,
    name: guestName,
    password: hashPassword(Math.random().toString(36)),
    isGuest: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(user);

  // ── Seed demo inventory for guest ──
  const now = new Date();
  const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  const demoProducts = [
    { name: "Sữa tươi", category: "dairy", company: "An Tam Demo", daysBeforeOpen: 7, daysAfterOpen: 5, isGlobal: false, ownerId: user.id },
    { name: "Tương cà", category: "sauces_spices", company: "An Tam Demo", daysBeforeOpen: 180, daysAfterOpen: 30, isGlobal: false, ownerId: user.id },
    { name: "Xúc xích", category: "meat_poultry", company: "An Tam Demo", daysBeforeOpen: 10, daysAfterOpen: 4, isGlobal: false, ownerId: user.id },
  ];

  const createdProducts = demoProducts.map((p) => {
    const prod = { ...p, id: crypto.randomUUID() };
    products.push(prod);
    return prod;
  });

  const demoItems = [
    { userId: user.id, userProductId: createdProducts[0].id, displayName: "Sữa tươi", openedAt: subDays(now, 4), expiryDate: addDays(now, 2), location: "fridge", status: "use_soon", notes: "Dùng cho bữa sáng hoặc pha cà phê.", quantity: "1 hộp" },
    { userId: user.id, userProductId: createdProducts[1].id, displayName: "Tương cà", openedAt: subDays(now, 4), expiryDate: addDays(now, 18), location: "room_temp", status: "fresh", notes: "Để ở kệ gia vị sau khi dùng.", quantity: "1 chai" },
    { userId: user.id, userProductId: createdProducts[2].id, displayName: "Xúc xích", openedAt: subDays(now, 5), expiryDate: addDays(now, 1), location: "fridge", status: "check_before_use", notes: "Đã mở gói, nên xem lại trước khi chế biến.", quantity: "300g" },
  ];

  demoItems.forEach((item) => {
    inventory.push({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  });

  const token = createAccessToken(user.id, true);
  await setAuthCookie(token);

  return NextResponse.json({
    message: "Đăng nhập với tư cách khách thành công",
    user: { id: user.id, name: user.name, email: user.email, isGuest: true },
  });
}

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
async function handleLogout() {
  await clearAuthCookie();
  return NextResponse.json({ message: "Logged out successfully" });
}

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
async function handleMe() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    let body: Record<string, unknown> = {};
    
    try {
      body = await request.json();
    } catch {
      // No body is OK for some routes (guest, logout)
    }

    switch (action) {
      case "signup":
        return handleSignup(body);
      case "login":
        return handleLogin(body);
      case "guest":
        return handleGuestLogin();
      case "logout":
        return handleLogout();
      default:
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("[API Auth]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (action === "me") return handleMe();
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
