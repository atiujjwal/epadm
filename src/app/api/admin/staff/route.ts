import { withApiObservability } from "@/lib/observability/api-handler";
import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createStaffProfile,
  deleteStaffProfile,
  listStaff,
  STAFF_READ_PERMISSION,
  STAFF_WRITE_PERMISSION,
  updateStaffProfile,
} from "@/lib/admin/registries";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const staffSchema = z.object({
  employeeCode: z.string().trim().min(2).max(40),
  fullName: z.string().trim().min(2).max(255),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employmentType: z.string().trim().max(40).optional().or(z.literal("")),
  joinedOn: z.string().trim().optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

const updateStaffSchema = staffSchema
  .omit({ dateOfBirth: true })
  .extend({
    id: z.string().uuid(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  });

const deleteStaffSchema = z.object({
  id: z.string().uuid(),
});

async function GETHandler(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const staff = await listStaff(ctx.tenantId, search);
    return ok({ staff });
  } catch (error) {
    console.error("[admin/staff][GET] Unexpected error:", error);
    return serverError();
  }
}

async function PATCHHandler(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = updateStaffSchema.parse(await req.json());

    const staff = await updateStaffProfile({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, staff });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[admin/staff][PATCH] Unexpected error:", error);
    return serverError();
  }
}

async function DELETEHandler(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = deleteStaffSchema.parse(await req.json());

    await deleteStaffProfile({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      id: input.id,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[admin/staff][DELETE] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = staffSchema.parse(await req.json());

    const staff = await createStaffProfile({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, staff }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/staff][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const PATCH = withApiObservability(PATCHHandler);
export const DELETE = withApiObservability(DELETEHandler);
export const POST = withApiObservability(POSTHandler);
