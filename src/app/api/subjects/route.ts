import { NextRequest, NextResponse } from "next/server";
import { createSubject, getSubjects } from "@/domains/academic-core/services";
import { getTenantId, handleError } from "@/lib/utils/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const body = await req.json();

    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: "Name and Code are required" },
        { status: 400 }
      );
    }
    const userId = req.headers.get("x-user-id");
    const subject = await createSubject(tenantId, body);
    return NextResponse.json({ data: subject }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const subjectsList = await getSubjects(tenantId);
    return NextResponse.json({ data: subjectsList });
  } catch (error) {
    return handleError(error);
  }
}
