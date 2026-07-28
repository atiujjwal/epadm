import { withApiObservability } from "@/lib/observability/api-handler";
import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ACADEMICS_READ_PERMISSION,
  ACADEMICS_WRITE_PERMISSION,
  createSection,
  listSections,
} from "@/lib/admin/academic-structure";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const createSectionSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

async function GETHandler() {
  try {
    const ctx = await requirePermission(ACADEMICS_READ_PERMISSION);
    const sections = await listSections(ctx.tenantId);
    return ok({ sections });
  } catch (error) {
    console.error("[admin/academics/sections][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(ACADEMICS_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = createSectionSchema.parse(await req.json());

    const created = await createSection({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, section: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }
    if (error instanceof Error && error.message) {
      return badRequest(error.message);
    }
    console.error("[admin/academics/sections][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
