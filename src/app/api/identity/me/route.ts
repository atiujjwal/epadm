import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserPermissions } from "@/domains/identity-tenancy/services";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set RLS Context
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const permissions = await getUserPermissions(client, tenantId, userId);

    return NextResponse.json({
      data: {
        userId,
        tenantId,
        permissions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
