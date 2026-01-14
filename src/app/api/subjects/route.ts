import { NextRequest, NextResponse } from "next/server";
import { createSubject, getSubjects } from "@/domains/academic-core/services";
import { getTenantContext, handleError } from "@/lib/utils/api-helpers";
import { pool } from "@/lib/db";
import z from "zod";

const createSubjectSchema = z.object({
  name: z.string().min(3),
  code: z.string(),
  type: z.enum(["THEORY" , "PRACTICAL" , "BOTH"]),
  credits: z.string().optional()
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { tenantId, userId } = getTenantContext(req);
    const body = await req.json();
    const data = createSubjectSchema.parse(body);

    if (!data) {
      return NextResponse.json(
        { error: "Invalid Data" },
        { status: 400 }
      );
    }
    const subject = await createSubject(client, tenantId, userId, body);
    return NextResponse.json({ data: subject }, { status: 201 });
  } catch (error) {
    return handleError(error);
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { tenantId, userId } = getTenantContext(req);
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
    const skip = Number(req.nextUrl.searchParams.get("skip")) || 0;

    const subjectsList = await getSubjects({client, tenantId, userId, limit, skip});
    return NextResponse.json({ data: subjectsList });
  } catch (error) {
    return handleError(error);
  } finally {
    client.release();
  }
}
