import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = "antam-bki-2026-secret";

// ── Cookie config ──
const COOKIE_NAME = "accessToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  maxAge: 2 * 60 * 60, // 2 hours in seconds
  path: "/",
};

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

/**
 * Read userId from the request cookies.
 * Works in Route Handlers via next/headers cookies().
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return (payload?.userId as string) || null;
}

/**
 * Set auth cookie ON the NextResponse object.
 * This is the correct way in Route Handlers (not via cookies() API).
 */
export function setAuthCookieOnResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return response;
}

/**
 * Clear auth cookie ON the NextResponse object.
 */
export function clearAuthCookieOnResponse(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

// Simple password hashing (demo only — NOT production-grade)
export function hashPassword(password: string): string {
  return Buffer.from(`hashed:${password}:${JWT_SECRET}`).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
