import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  ACADEMICS_READ_PERMISSION,
  ACADEMICS_WRITE_PERMISSION,
  createClass,
  listClasses,
} from "@/lib/admin/academic-structure";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const createClassSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  academicYear: z.string().trim().min(4).max(20),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  homeroomStaffId: z.string().trim().uuid().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const ctx = await requirePermission(ACADEMICS_READ_PERMISSION);
    const classes = await listClasses(ctx.tenantId);
    return ok({ classes });
  } catch (error) {
    console.error("[admin/academics/classes][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
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
