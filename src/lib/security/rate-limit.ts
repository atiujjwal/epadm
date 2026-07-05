import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_LIMIT_MAX = 10;

const store = new Map<string, RateLimitEntry>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function checkAuthRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const key = `auth:${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > AUTH_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  return null;
}
