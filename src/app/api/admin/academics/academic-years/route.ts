import { withApiObservability } from "@/lib/observability/api-handler";
import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ACADEMICS_READ_PERMISSION,
  ACADEMICS_WRITE_PERMISSION,
  createAcademicYear,
  listAcademicYears,
} from "@/lib/admin/academic-structure";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const academicYearSchema = z.object({
  name: z.string().trim().min(4).max(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isCurrent: z.boolean().optional(),
});

async function GETHandler() {
  try {
    const ctx = await requirePermission(ACADEMICS_READ_PERMISSION);
    const academicYears = await listAcademicYears(ctx.tenantId);
    return ok({ academicYears });
  } catch (error) {
    console.error("[admin/academics/academic-years][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(ACADEMICS_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = academicYearSchema.parse(await req.json());

    const academicYear = await createAcademicYear({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, academicYear }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }
    if (error instanceof Error && error.message) {
      return badRequest(error.message);
    }
    console.error("[admin/academics/academic-years][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
