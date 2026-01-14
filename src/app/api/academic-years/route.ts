import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";
import {
  createAcademicYear,
  getAcademicYears,
} from "@/domains/academic-core/services";
import { getTenantContext } from "@/lib/utils/api-helpers";

export const createAcademicYearSchema = z
  .object({
    name: z.string().trim().min(3),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isCurrent: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "startDate must be before endDate",
    path: ["endDate"],
  })
  .strict();

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { tenantId, userId } = getTenantContext(req);
    const body = await req.json();

    const data = createAcademicYearSchema.parse(body);

    if (!data) {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }

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
    const { tenantId, userId } = getTenantContext(req);

    await client.query(`SET app.current_tenant = '${tenantId}'`);
    const result = await getAcademicYears(client, tenantId, userId);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
