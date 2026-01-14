import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";
import { createStudent, getStudents } from "@/domains/academic-core/services";
import { getTenantContext } from "@/lib/utils/api-helpers";

export const createStudentSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    admissionNumber: z.string().trim().min(1),
    rollNumber: z.string().trim().optional(),
    academicYearId: z.string().uuid(),
    sectionId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    dob: z.union([z.string().datetime(), z.coerce.date()]),
    attributes: z.record(z.string(), z.any()).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { tenantId, userId } = getTenantContext(req);

    const body = await req.json();
    const data = createStudentSchema.parse(body);

    if (!data) {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }

    // Set RLS Context for this transaction
    await client.query(`SET app.current_tenant = '${tenantId}'`);

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
