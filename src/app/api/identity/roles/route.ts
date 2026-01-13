import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getTenantRoles } from "@/domains/identity-tenancy/services";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const rolesList = await getTenantRoles(client, tenantId);

    return NextResponse.json({ data: rolesList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
