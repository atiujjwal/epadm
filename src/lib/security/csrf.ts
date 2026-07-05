import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isMutationMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.toUpperCase());
}

export function validateCsrf(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return null;
  }

  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return null;
  }

  if (!isMutationMethod(req.method)) {
    return null;
  }

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
}

export function attachCsrfCookie(
  req: NextRequest,
  response: NextResponse,
): NextResponse {
  if (req.cookies.get(CSRF_COOKIE)?.value) {
    return response;
  }

  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
