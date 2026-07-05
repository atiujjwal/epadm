import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ACADEMICS_READ_PERMISSION,
  ACADEMICS_WRITE_PERMISSION,
  createEnrollment,
  listEnrollments,
} from "@/lib/admin/academic-structure";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional().or(z.literal("")),
  academicYear: z.string().trim().min(4).max(20),
  rollNumber: z.string().trim().max(20).optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  enrolledOn: z.string().trim().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const ctx = await requirePermission(ACADEMICS_READ_PERMISSION);
    const enrollments = await listEnrollments(ctx.tenantId);
    return ok({ enrollments });
  } catch (error) {
    console.error("[admin/academics/enrollments][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(ACADEMICS_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = createEnrollmentSchema.parse(await req.json());

    const created = await createEnrollment({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, enrollment: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }
    if (error instanceof Error && error.message) {
      return badRequest(error.message);
    }
    console.error("[admin/academics/enrollments][POST] Unexpected error:", error);
    return serverError();
  }
}
