import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth/token";
import { resolveTenantId } from "./lib/auth/rbac";

export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.includes(".") 
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get("host") || "web.demo";
  const subdomain = hostname.split(".")[0];
  const tenantId = await resolveTenantId(subdomain);

  if (!tenantId) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // Authentication (JWT)
  const token = req.cookies.get("auth_token")?.value || 
                req.headers.get("authorization")?.replace("Bearer ", "");
  
  let userId = "";
  let userRole = "";

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload && payload.tenantId === tenantId) {
      // Valid session for THIS tenant
      userId = payload.userId;
      userRole = payload.role;
    }
    // If payload.tenantId !== resolvedTenantId, user is logged in but visiting wrong school subdomain -> Treat as Guest
  }

  // Header Injection
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-id", tenantId);
  
  if (userId) {
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", userRole);
  }

  // URL Rewrite
  const url = req.nextUrl.clone();
  url.pathname = `/_root/${tenantId}${url.pathname}`;

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};