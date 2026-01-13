import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createFeeStructure,
  getFeeStructures,
} from "@/domains/finance/services";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    await client.query("BEGIN");
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await createFeeStructure(client, tenantId, userId, body);

    await client.query("COMMIT");
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
