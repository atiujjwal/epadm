import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { markAttendance } from "@/domains/attendance/services";
import { MarkAttendanceInput } from "@/domains/attendance/types";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: MarkAttendanceInput = await req.json();

    await client.query("BEGIN");
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // In a real app, we need to fetch the academicYearId contextually
    // For now, assume it's passed or resolved via current active year
    const academicYearId = "current-year-uuid"; // Replace with resolver logic

    const result = await markAttendance(
      client,
      tenantId,
      userId,
      academicYearId,
      body
    );

    await client.query("COMMIT");
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
