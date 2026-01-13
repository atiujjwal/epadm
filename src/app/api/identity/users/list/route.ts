import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getTenantUsers } from "@/domains/identity-tenancy/services";
import { requirePermission } from "@/lib/auth/rbac"; // Ensure this helper checks x-tenant-id internally via DB

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set Context
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Check Permissions (Only Admins/Principals should see full list)
    await requirePermission(client, userId, "users.manage");

    // Fetch Data
    const usersList = await getTenantUsers(client, tenantId);

    return NextResponse.json({ data: usersList });
  } catch (error: any) {
    // Graceful degradation for permission errors
    if (error.message.includes("Access Denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
