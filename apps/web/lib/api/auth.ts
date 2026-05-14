/**
 * Auth API utility for Web application
 */

// Lấy base URL từ môi trường hoặc mặc định localhost
function getAuthApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) return "";
  return "http://localhost:3001";
}

export type AuthApiUser = {
  id?: string;
  name?: string;
  email?: string;
};

export async function signup(name: string, email: string, password: string) {
  const res = await fetch(`${getAuthApiUrl()}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Signup failed");
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${getAuthApiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }

  // Lưu ý: Token được trả về qua HttpOnly Cookie từ phía API
  return res.json();
}

export async function logout() {
  const res = await fetch(`${getAuthApiUrl()}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

export async function guestLogin() {
  const res = await fetch(`${getAuthApiUrl()}/api/auth/guest`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Guest login failed");
  }

  return res.json();
}

export function getUserFromAuthResponse(payload: unknown): AuthApiUser | null {
  const candidate = readUserCandidate(payload);
  if (!candidate) return null;

  const user: AuthApiUser = {};

  if (typeof candidate.id === "string" && candidate.id.trim()) {
    user.id = candidate.id.trim();
  }

  if (typeof candidate.name === "string" && candidate.name.trim()) {
    user.name = candidate.name.trim();
  }

  if (typeof candidate.email === "string" && candidate.email.trim()) {
    user.email = candidate.email.trim();
  }

  return Object.keys(user).length > 0 ? user : null;
}

function readUserCandidate(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  if (isRecord(record.user)) {
    return record.user;
  }

  if (isRecord(record.data)) {
    if (isRecord(record.data.user)) {
      return record.data.user;
    }

    if ("email" in record.data || "name" in record.data || "id" in record.data) {
      return record.data;
    }
  }

  if ("email" in record || "name" in record || "id" in record) {
    return record;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
