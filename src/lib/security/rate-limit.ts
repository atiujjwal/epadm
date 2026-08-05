import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  aiGenerate: { windowMs: 60 * 1000, maxRequests: 5 },
  webhooks: { windowMs: 60 * 1000, maxRequests: 200 },
  standard: { windowMs: 60 * 1000, maxRequests: 100 },
  reports: { windowMs: 60 * 1000, maxRequests: 10 },
  bulk: { windowMs: 60 * 1000, maxRequests: 20 },
} as const satisfies Record<string, RateLimitConfig>;

function getClientIp(req: NextRequest | Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimit(
  config: RateLimitConfig,
  identifier: string,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = store.get(identifier);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(identifier, entry);
  }

  entry.count += 1;

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: Math.max(config.maxRequests - entry.count, 0),
    resetAt: entry.resetAt,
  };
}

export function checkRateLimit(
  config: RateLimitConfig,
  req: NextRequest | Request,
  tenantId?: string | null,
  namespace = "api",
): NextResponse | Response | null {
  const ip = getClientIp(req);
  const path = "nextUrl" in req ? req.nextUrl.pathname : new URL(req.url).pathname;
  const identifier = `${namespace}:${ip}:${tenantId ?? "public"}:${path}`;
  const result = rateLimit(config, identifier);

  if (result.allowed) return null;

  const retryAfter = Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(config.maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}

export function checkAuthRateLimit(req: NextRequest): NextResponse | null {
  return checkRateLimit(RATE_LIMITS.auth, req, null, "auth") as NextResponse | null;
}

export function rateLimitForPath(pathname: string): RateLimitConfig {
  if (pathname.includes("/reset-password")) return RATE_LIMITS.passwordReset;
  if (pathname.startsWith("/api/v1/ai-studio/generate")) return RATE_LIMITS.aiGenerate;
  if (pathname.includes("/webhook") || pathname.startsWith("/api/webhooks/")) return RATE_LIMITS.webhooks;
  if (pathname.startsWith("/api/v1/analytics/reports/run")) return RATE_LIMITS.reports;
  if (pathname.includes("/imports") || pathname.includes("/bulk")) return RATE_LIMITS.bulk;
  return RATE_LIMITS.standard;
}
