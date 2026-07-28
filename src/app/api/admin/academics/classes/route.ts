import { withApiObservability } from "@/lib/observability/api-handler";
import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ACADEMICS_READ_PERMISSION,
  ACADEMICS_WRITE_PERMISSION,
  createClass,
  listClasses,
  updateClass,
} from "@/lib/admin/academic-structure";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const createClassSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  academicYearId: z.string().uuid(),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  classTeacherId: z.string().uuid(),
});

const updateClassSchema = createClassSchema.extend({
  id: z.string().uuid(),
});

async function GETHandler() {
  try {
    const ctx = await requirePermission(ACADEMICS_READ_PERMISSION);
    const classes = await listClasses(ctx.tenantId);
    return ok({ classes });
  } catch (error) {
    console.error("[admin/academics/classes][GET] Unexpected error:", error);
    return serverError();
  }
}

async function PATCHHandler(req: Request) {
  try {
    const ctx = await requirePermission(ACADEMICS_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = updateClassSchema.parse(await req.json());

    const updated = await updateClass({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, class: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }
    if (error instanceof Error && error.message) {
      return badRequest(error.message);
    }
    console.error("[admin/academics/classes][PATCH] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(ACADEMICS_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = createClassSchema.parse(await req.json());

    const created = await createClass({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, class: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }
    if (error instanceof Error && error.message) {
      return badRequest(error.message);
    }
    console.error("[admin/academics/classes][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const PATCH = withApiObservability(PATCHHandler);
export const POST = withApiObservability(POSTHandler);
