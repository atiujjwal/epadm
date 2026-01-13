import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createStudent, getStudents } from "@/domains/academic-core/services";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Missing Context" }, { status: 401 });
    }

    const body = await req.json();

    // Set RLS Context for this transaction
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Execute Logic
    const result = await createStudent(client, tenantId, userId, body);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Missing Context" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId") || undefined;
    const academicYearId = searchParams.get("academicYearId") || undefined;

    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await getStudents(client, tenantId, userId, {
      sectionId,
      academicYearId,
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
