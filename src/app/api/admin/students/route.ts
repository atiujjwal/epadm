import { withApiObservability } from "@/lib/observability/api-handler";
import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createStudent,
  listStudents,
  STUDENT_READ_PERMISSION,
  STUDENT_WRITE_PERMISSION,
} from "@/lib/admin/registries";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const studentSchema = z.object({
  admissionNumber: z.string().trim().min(2).max(40),
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  gender: z.string().trim().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  classLabel: z.string().trim().max(80).optional().or(z.literal("")),
  sectionLabel: z.string().trim().max(80).optional().or(z.literal("")),
  guardianName: z.string().trim().max(255).optional().or(z.literal("")),
  guardianPhone: z.string().trim().max(20).optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

async function GETHandler(req: Request) {
  try {
    const ctx = await requirePermission(STUDENT_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const students = await listStudents(ctx.tenantId, search);
    return ok({ students });
  } catch (error) {
    console.error("[admin/students][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(STUDENT_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = studentSchema.parse(await req.json());

    const student = await createStudent({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, student }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/students][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
