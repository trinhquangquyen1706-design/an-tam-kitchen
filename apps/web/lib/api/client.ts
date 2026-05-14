import { clearAuthHint } from "@/lib/auth-session";

export class ApiError extends Error {
  readonly status?: number;
  readonly payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const AUTH_REQUIRED_MESSAGE = "Bạn cần đăng nhập để sử dụng tính năng này.";
const SESSION_EXPIRED_MESSAGE =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
const AUTH_ERROR_PATTERNS = [
  "authentication required",
  "invalid or expired token",
  "unauthorized",
];

const DEFAULT_API_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // On Vercel (or any non-localhost), use same-origin (empty string = relative URL)
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return "";
  }
  return DEFAULT_API_BASE_URL;
}

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown>;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    body,
    headers,
    credentials: "include",
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    const error = new ApiError(
      getErrorMessage(payload, response.statusText),
      response.status,
      payload
    );

    if (isAuthError(error)) {
      clearAuthHint();
    }

    throw error;
  }

  return unwrapApiResponse(payload) as T;
}

export function isAuthError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return true;

  const message = getComparableErrorText(error);
  return AUTH_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export function getAuthErrorMessage(error: unknown) {
  const message = getComparableErrorText(error);

  if (message.includes("invalid or expired token")) {
    return SESSION_EXPIRED_MESSAGE;
  }

  return AUTH_REQUIRED_MESSAGE;
}

function getComparableErrorText(error: unknown) {
  const parts: string[] = [];

  if (error instanceof Error) {
    parts.push(error.message);
  }

  if (error instanceof ApiError) {
    parts.push(readPayloadMessage(error.payload));
  } else {
    parts.push(readPayloadMessage(error));
  }

  return parts.filter(Boolean).join(" ").toLowerCase();
}

function readPayloadMessage(payload: unknown) {
  if (typeof payload === "string") return payload;

  if (payload && typeof payload === "object") {
    const maybeError = "error" in payload ? payload.error : undefined;
    const maybeMessage = "message" in payload ? payload.message : undefined;

    if (typeof maybeError === "string") return maybeError;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return "";
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const maybeError = "error" in payload ? payload.error : undefined;
    const maybeMessage = "message" in payload ? payload.message : undefined;

    if (typeof maybeError === "string") return maybeError;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return fallback || "API request failed";
}

async function readResponsePayload(response: Response) {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return response.text();
  }

  return response.json();
}

function unwrapApiResponse(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as Record<string, unknown>).data;
  }

  return payload;
}
