import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCommunicationChanges } from "@/domains/communication/services";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lastPulledAt = parseInt(
      searchParams.get("last_pulled_at") || "0",
      10
    );

    await client.query(`SET app.current_tenant = '${tenantId}'`);
    const result = await getCommunicationChanges(
      client,
      tenantId,
      userId,
      lastPulledAt
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
