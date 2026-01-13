import { NextRequest, NextResponse } from "next/server";

export function getTenantId(req: NextRequest): string {
  // In production, this comes from the Middleware injection via headers
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    throw new Error("Tenant context missing");
  }
  return tenantId;
}

export function handleError(error: any) {
  console.error("API Error:", error);
  // Distinguish between validation errors, auth errors, and system errors
  if (error.message === "Tenant context missing") {
    return NextResponse.json({ error: "Unauthorized Tenant" }, { status: 401 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
