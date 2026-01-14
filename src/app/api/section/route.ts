import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createSection, getSections } from "@/domains/academic-core/services";
import { getTenantContext } from "@/lib/utils/api-helpers";

import { z } from "zod";

export const createSectionSchema = z
  .object({
    classId: z.string().uuid(),
    name: z.string().trim().min(1), // "A", "Blue", etc.
    classTeacherId: z.string().uuid().optional(),
  })
  .strict();


export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { tenantId, userId } = getTenantContext(req);
    const body = await req.json();

    const data = createSectionSchema.parse(body);

    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await createSection(client, tenantId, userId, data);

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

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") || undefined;

    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await getSections(client, tenantId, userId, classId);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
