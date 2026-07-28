import { withApiObservability } from "@/lib/observability/api-handler";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ADMISSION_READ_PERMISSION,
  ADMISSION_WRITE_PERMISSION,
  createAdmission,
  listAdmissions,
} from "@/lib/admin/admissions";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const admissionSchema = z.object({
  applicantName: z.string().trim().min(2).max(255),
  grade: z.string().trim().min(1).max(40),
  stage: z.string().trim().max(60).optional().or(z.literal("")),
  fitScore: z.number().int().min(0).max(100).optional(),
  owner: z.string().trim().max(255).optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

async function GETHandler(req: Request) {
  try {
    const ctx = await requirePermission(ADMISSION_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const admissions = await listAdmissions(ctx.tenantId, search);
    return ok({ admissions });
  } catch (error) {
    console.error("[admin/admissions][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(ADMISSION_WRITE_PERMISSION);
    const input = admissionSchema.parse(await req.json());

    const admission = await createAdmission({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, admission }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[admin/admissions][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
