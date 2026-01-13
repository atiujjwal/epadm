import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createAcademicYear,
  getAcademicYears,
} from "@/domains/academic-core/services";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id")!;
    const userId = req.headers.get("x-user-id")!;
    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    await client.query(`SET app.current_tenant = '${tenantId}'`);
    const result = await createAcademicYear(client, tenantId, userId, body);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id")!;
    const userId = req.headers.get("x-user-id")!;
    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await client.query(`SET app.current_tenant = '${tenantId}'`);
    const result = await getAcademicYears(client, tenantId, userId);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
