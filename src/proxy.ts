import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth/token";
import {
  PLATFORM_COOKIE,
  verifyPlatformToken,
} from "./lib/platform/auth/token";
import { attachCsrfCookie, validateCsrf } from "./lib/security/csrf";
import { checkAuthRateLimit } from "./lib/security/rate-limit";
import {
  canManageOnboarding,
  getOnboardingStatusForGate,
} from "./lib/onboarding/gate";

/**
 * True only for control-plane (ops) routes under `/admin`. Must match `/admin`
 * exactly or a `/admin/` sub-path — NOT sibling tenant routes that merely share
 * the prefix, e.g. `/admin-dashboard`. A naive `startsWith("/admin")` would send
 * the tenant admin dashboard to the ops host and bounce it to `/admin/login`.
 */
function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Platform-only admin paths; tenant RBAC lives at exactly `/admin` on school hosts. */
function isPlatformAdminPath(pathname: string): boolean {
  return isAdminPath(pathname) && pathname !== "/admin";
}

function finalize(
  req: NextRequest,
  response: NextResponse,
  requestId: string,
) {
  response.headers.set("x-request-id", requestId);
  return attachCsrfCookie(req, response);
}

const TRUSTED_CONTEXT_HEADERS = [
  "x-tenant-id",
  "x-user-id",
  "x-user-role",
  "x-plan-tier",
  "x-app-plane",
  "x-platform-operator-id",
  "x-platform-operator-email",
  "x-platform-session-id",
] as const;

/** Remove identity headers supplied by the caller before injecting session data. */
function sanitizedRequestHeaders(req: NextRequest, requestId: string): Headers {
  const requestHeaders = new Headers(req.headers);
  for (const header of TRUSTED_CONTEXT_HEADERS) {
    requestHeaders.delete(header);
  }
  requestHeaders.set("x-request-id", requestId);
  return requestHeaders;
}

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/register",
  "/about",
  "/contact",
  "/demo",
  "/platform",
  "/security",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/accessibility",
]);
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
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
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
      return finalize(req, rateLimited, requestId);
    }
  }

  // 2. CSRF token validation on mutation requests
  const csrfViolation = validateCsrf(req);
  if (csrfViolation) {
    return finalize(req, csrfViolation, requestId);
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
    res = await handleOpsRequest(req, pathname, requestId);
  } else if (isPlatformAdminPath(pathname)) {
    const hostHeader = req.headers.get("host") ?? "";
    const parts = hostHeader.split(":");
    const port = parts[1] ? `:${parts[1]}` : "";
    const opsHost = process.env.OPS_HOST || "ops.localhost";
    const redirectUrl = new URL(req.nextUrl.toString());
    redirectUrl.host = `${opsHost}${port}`;
    return finalize(req, NextResponse.redirect(redirectUrl), requestId);
  } else if (pathname.startsWith("/api/platform")) {
    res = NextResponse.json({ error: "Not found" }, { status: 404 });
  } else {
    res = await handleTenantRequest(req, pathname, requestId);
  }

  return finalize(req, res, requestId);
}

async function handleOpsRequest(req: NextRequest, pathname: string, requestId: string) {
  const platformToken = req.cookies.get(PLATFORM_COOKIE)?.value;
  let operatorId = "";
  let operatorEmail = "";
  let sessionId = "";

  if (platformToken) {
    const payload = await verifyPlatformToken(platformToken);
    if (payload) {
      operatorId = payload.operatorId;
      operatorEmail = payload.email;
      sessionId = payload.sessionId;
    }
  }

  const requestHeaders = sanitizedRequestHeaders(req, requestId);
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
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/platform")) {
    if (!operatorId && !isPublic) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!operatorId && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Design reference uses /cms for the platform console; alias on ops host.
  // This runs after authentication so the alias cannot bypass the ops gate.
  if (pathname === "/cms" || pathname.startsWith("/cms/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/cms/, "/admin");
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

async function handleTenantRequest(req: NextRequest, pathname: string, requestId: string) {
  const token = req.cookies.get("auth_token")?.value;
  let userId = "";
  let userRole = "";
  let tenantId = "";
  let planTier = "";

  if (token) {
    try {
      const payload = await verifySessionToken(token);

      if (payload) {
        tenantId = payload.tenantId as string;
        userId = payload.userId as string;
        userRole = payload.role as string;
        planTier = payload.planTier as string;

      }
    } catch (err) {
      console.warn("Invalid token in proxy:", err);
    }
  }

  const requestHeaders = sanitizedRequestHeaders(req, requestId);
  if (userId) {
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-plan-tier", planTier);
    requestHeaders.set("x-app-plane", "tenant");
  }

  const isPublicPage = PUBLIC_PATHS.has(pathname);

  const legacyRouteRedirects: Record<string, string> = {
    "/admin": "/administration/users",
    "/admin-dashboard": "/dashboard",
    "/teacher/home": "/teacher",
    "/student/home": "/student",
    "/fees": "/finance/fees",
    "/staff": "/hr/staff",
    "/timetable": "/timetables",
    "/exams": "/assessments",
    "/vehicles": "/transport",
    "/labs": "/laboratories",
    "/intelligence": "/analytics",
    "/mobile": "/digital-experience",
    "/settings": "/administration/school",
    "/onboarding": "/setup",
    "/setup-pending": "/setup/pending",
  };
  const canonicalPath = legacyRouteRedirects[pathname];
  if (canonicalPath) {
    const canonicalUrl = req.nextUrl.clone();
    canonicalUrl.pathname = canonicalPath;
    return NextResponse.redirect(canonicalUrl, 301);
  }

  if (pathname === "/users" || pathname.startsWith("/users/")) {
    const adminUrl = req.nextUrl.clone();
    adminUrl.pathname = pathname.replace(/^\/users/, "/administration/users");
    return NextResponse.redirect(adminUrl, 301);
  }

  if (!userId && !isPublicPage && !pathname.startsWith("/api")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/";
    loginUrl.search = "";
    loginUrl.hash = "login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!userId) {
    return NextResponse.next();
  }

  // Authenticated below. Public/pre-auth paths must NOT be rewritten into the
  // tenant workspace (`/root/{tenantId}/...`) — no such pages exist there, so
  // the rewrite would 404. An already-authenticated visit to the login page is
  // sent to the workspace root, which role-redirects to the right dashboard.
  if (pathname === "/login") {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  // Other public marketing/legal pages stay viewable without tenant scoping.
  // `/` is intentionally excluded so it still rewrites to the tenant root and
  // performs its role-based dashboard redirect.
  if (isPublicPage && pathname !== "/") {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (userId) {
    const onboardingStatus = await getOnboardingStatusForGate(tenantId);
    const isOnboardingPath = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
    const isSetupPendingPath = pathname === "/setup-pending" || pathname.startsWith("/setup-pending/");
    const incomplete = onboardingStatus !== "COMPLETED";

    if (incomplete && canManageOnboarding(userRole) && !isOnboardingPath) {
      const onboardingUrl = req.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      onboardingUrl.search = "";
      return NextResponse.redirect(onboardingUrl);
    }

    if (incomplete && !canManageOnboarding(userRole) && !isSetupPendingPath) {
      const pendingUrl = req.nextUrl.clone();
      pendingUrl.pathname = "/setup-pending";
      pendingUrl.search = "";
      return NextResponse.redirect(pendingUrl);
    }

    if (!incomplete && (isOnboardingPath || isSetupPendingPath)) {
      const appUrl = req.nextUrl.clone();
      appUrl.pathname = "/";
      appUrl.search = "";
      return NextResponse.redirect(appUrl);
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = `/root/${tenantId}${pathname}`;

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
