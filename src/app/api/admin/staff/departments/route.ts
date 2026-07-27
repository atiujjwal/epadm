import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createStaffDepartment,
  deleteStaffDepartment,
  listStaffDepartments,
  STAFF_READ_PERMISSION,
  STAFF_WRITE_PERMISSION,
  updateStaffDepartment,
} from "@/lib/admin/registries";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const departmentSchema = z.object({
  code: z.string().trim().max(40).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  headStaffId: z.string().uuid().optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  vacancies: z.coerce.number().int().min(0).max(500).optional(),
});

const updateDepartmentSchema = departmentSchema.extend({
  id: z.string().uuid(),
});

const deleteDepartmentSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  try {
    const ctx = await requirePermission(STAFF_READ_PERMISSION);
    const departments = await listStaffDepartments(ctx.tenantId);
    return ok({ departments });
  } catch (error) {
    console.error("[admin/staff/departments][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const input = departmentSchema.parse(await req.json());
    const department = await createStaffDepartment({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
    });
    return ok({ success: true, department }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[admin/staff/departments][POST] Unexpected error:", error);
    return serverError();
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const input = updateDepartmentSchema.parse(await req.json());
    const department = await updateStaffDepartment({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
    });
    return ok({ success: true, department });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[admin/staff/departments][PATCH] Unexpected error:", error);
    return serverError();
  }
}

export async function DELETE(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const input = deleteDepartmentSchema.parse(await req.json());
    await deleteStaffDepartment({ tenantId: ctx.tenantId, id: input.id });
    return ok({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[admin/staff/departments][DELETE] Unexpected error:", error);
    return serverError();
  }
}
