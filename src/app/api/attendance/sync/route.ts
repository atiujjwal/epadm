import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAttendanceChanges } from "@/domains/attendance/services";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lastPulledAt = parseInt(
      searchParams.get("last_pulled_at") || "0",
      10
    );

    // Sync is a READ operation, but we set context for safety
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await getAttendanceChanges(
      client,
      tenantId,
      userId,
      lastPulledAt
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Attendance Sync] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// TODO: Note: POST (Push) endpoint would accept a JSON of changes and call
// markAttendance() loop for each "created" or "updated" record.
 