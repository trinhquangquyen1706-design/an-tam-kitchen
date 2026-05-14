import { cookies } from "next/headers";
import { type User, users } from "./store";

const JWT_SECRET = "antam-bki-2026-secret";

// Simple JWT-like token (no external dependency needed)
function createToken(payload: Record<string, unknown>, expiresInMs: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + expiresInMs })).toString("base64url");
  const signature = Buffer.from(`${header}.${body}.${JWT_SECRET}`).toString("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAccessToken(userId: string, isGuest = false): string {
  return createToken({ userId, isGuest }, 2 * 60 * 60 * 1000); // 2 hours
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return (payload?.userId as string) || null;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 2 * 60 * 60, // 2 hours in seconds
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
}

// Simple password hashing (demo only — NOT production-grade)
export function hashPassword(password: string): string {
  return Buffer.from(`hashed:${password}:${JWT_SECRET}`).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
