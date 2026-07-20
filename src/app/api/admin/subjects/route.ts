import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createSubject,
  listSubjects,
  SUBJECT_READ_PERMISSION,
  SUBJECT_WRITE_PERMISSION,
} from "@/lib/admin/subjects";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const subjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(1).max(40),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    const ctx = await requirePermission(SUBJECT_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const subjects = await listSubjects(ctx.tenantId, search);
    return ok({ subjects });
  } catch (error) {
    console.error("[admin/subjects][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(SUBJECT_WRITE_PERMISSION);
    const input = subjectSchema.parse(await req.json());

    const subject = await createSubject({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, subject }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/subjects][POST] Unexpected error:", error);
    return serverError();
  }
}
