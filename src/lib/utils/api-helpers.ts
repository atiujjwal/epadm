import { NextRequest, NextResponse } from "next/server";

interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
}


export function getTenantContext(req: NextRequest): TenantContext {
  const tenantId = req.headers.get("x-tenant-id") || "";
  const userId = req.headers.get("x-user-id") || "";
  const userRole = req.headers.get("x-user-role") || "";
  return {tenantId, userId, userRole};
}

export function handleError(error: any) {
  console.error("API Error:", error);
  // Distinguish between validation errors, auth errors, and system errors
  if (error.message === "Tenant context missing") {
    return NextResponse.json({ error: "Unauthorized Tenant" }, { status: 401 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
