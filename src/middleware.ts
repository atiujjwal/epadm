import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth/token";

export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname.startsWith("/api/auth/login") ||
    req.nextUrl.pathname.startsWith("/api/auth/logout") ||
    req.nextUrl.pathname.startsWith("/api/identity/tenant")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  let userId = "";
  let userRole = "";
  let tenantId = "";

  if (token) {
    try {
      const payload = await verifySessionToken(token);

      if (payload) {
        tenantId = payload.tenantId as string;
        userId = payload.userId as string;
        userRole = payload.role as string;
      }
    } catch (err) {
      console.log("Invalid token: ", err);
      console.warn("Invalid Token in Middleware");
    }
  }

  // Header Injection
  const requestHeaders = new Headers(req.headers);
  if (userId) {
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", userRole);
  }

  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // URL Rewrite
  const url = req.nextUrl.clone();
  url.pathname = `/_root/${tenantId}${url.pathname}`;

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
