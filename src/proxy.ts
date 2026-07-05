import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth/token";
import {
  PLATFORM_COOKIE,
  verifyPlatformToken,
} from "./lib/platform/auth/token";
import { touchPlatformSession } from "./lib/platform/auth/session";
import { isTenantActiveCached } from "./lib/platform/tenant-cache";
import { getActiveModulesForTenantCached } from "./lib/platform/tenants";
import { attachCsrfCookie, validateCsrf } from "./lib/security/csrf";
import { checkAuthRateLimit } from "./lib/security/rate-limit";

function finalize(req: NextRequest, response: NextResponse) {
  return attachCsrfCookie(req, response);
}

const PUBLIC_PATHS = new Set<string>(["/", "/login", "/register", "/onboarding"]);
const OPS_PUBLIC_PATHS = new Set<string>(["/admin/login"]);

export function isOpsHost(hostname: string): boolean {
  const opsHost = process.env.OPS_HOST?.trim().toLowerCase();
  const normalized = hostname.split(":")[0]?.toLowerCase() ?? "";

  if (opsHost) {
    return normalized === opsHost;
  }

  return normalized.startsWith("ops.");
}

export async function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  const opsMode = isOpsHost(hostname);

  // 1. Rate limiting on authentication routes
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/platform/auth/")
  ) {
    const rateLimited = checkAuthRateLimit(req);
    if (rateLimited) {
      return rateLimited;
    }
  }

  // 2. CSRF token validation on mutation requests
  const csrfViolation = validateCsrf(req);
  if (csrfViolation) {
    return csrfViolation;
  }

  let res: NextResponse;

  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/identity/tenant") ||
    pathname.startsWith("/api/platform/auth/login") ||
    pathname.startsWith("/api/platform/auth/mfa")
  ) {
    res = NextResponse.next();
  } else if (opsMode) {
    res = await handleOpsRequest(req, pathname);
  } else if (pathname.startsWith("/admin") || pathname.startsWith("/api/platform")) {
    res = NextResponse.json({ error: "Not found" }, { status: 404 });
  } else {
    res = await handleTenantRequest(req, pathname);
  }

  // 3. Attach CSRF cookie to responses
  return attachCsrfCookie(req, res);
}

async function handleOpsRequest(req: NextRequest, pathname: string) {
  const platformToken = req.cookies.get(PLATFORM_COOKIE)?.value;
  let operatorId = "";
  let operatorEmail = "";
  let sessionId = "";

  if (platformToken) {
    const payload = await verifyPlatformToken(platformToken);
    if (payload) {
      const liveOperatorId = await touchPlatformSession(payload.sessionId);
      if (liveOperatorId === payload.operatorId) {
        operatorId = payload.operatorId;
        operatorEmail = payload.email;
        sessionId = payload.sessionId;
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (operatorId) {
    requestHeaders.set("x-platform-operator-id", operatorId);
    requestHeaders.set("x-platform-operator-email", operatorEmail);
    requestHeaders.set("x-platform-session-id", sessionId);
    requestHeaders.set("x-app-plane", "ops");
  }

  const isPublic =
    OPS_PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/api/platform/auth/");

  if (!operatorId && !isPublic && !pathname.startsWith("/api")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return finalize(req, NextResponse.redirect(loginUrl));
  }

  if (pathname.startsWith("/api/platform")) {
    if (!operatorId && !isPublic) {
      return finalize(req, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    return finalize(
      req,
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
    );
  }

  if (!operatorId && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return finalize(req, NextResponse.redirect(loginUrl));
  }

  return finalize(
    req,
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
  );
}

async function handleTenantRequest(req: NextRequest, pathname: string) {
  const token = req.cookies.get("auth_token")?.value;
  let userId = "";
  let userRole = "";
  let tenantId = "";
  let planTier = "";
  let activeModules: string[] = [];

  if (token) {
    try {
      const payload = await verifySessionToken(token);

      if (payload) {
        tenantId = payload.tenantId as string;
        userId = payload.userId as string;
        userRole = payload.role as string;
        planTier = payload.planTier as string;

        const cachedActive = await isTenantActiveCached(tenantId);
        if (cachedActive === false) {
          if (pathname.startsWith("/api")) {
            return finalize(
              req,
              NextResponse.json(
                { error: "School account is deactivated" },
                { status: 403 },
              ),
            );
          }

          return finalize(
            req,
            new NextResponse("School account is deactivated", {
              status: 403,
            }),
          );
        }

        activeModules = await getActiveModulesForTenantCached(tenantId);
      }
    } catch (err) {
      console.warn("Invalid token in proxy:", err);
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (userId) {
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-plan-tier", planTier);
    requestHeaders.set("x-active-modules", activeModules.join(","));
    requestHeaders.set("x-app-plane", "tenant");
  }

  const isPublicPage = PUBLIC_PATHS.has(pathname);

  if (!userId && !isPublicPage && !pathname.startsWith("/api")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return finalize(req, NextResponse.redirect(loginUrl));
  }

  if (pathname.startsWith("/api")) {
    return finalize(
      req,
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
    );
  }

  if (!userId) {
    return finalize(
      req,
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = `/_root/${tenantId}${pathname}`;

  return finalize(
    req,
    NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    }),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
