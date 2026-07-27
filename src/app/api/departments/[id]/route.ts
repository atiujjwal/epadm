import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  deleteStaffDepartment,
  STAFF_WRITE_PERMISSION,
} from "@/lib/admin/registries";
import { badRequest, ok, serverError } from "@/lib/http/responses";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const { id } = await params;
    const departmentId = z.string().uuid().parse(id);

    await deleteStaffDepartment({ tenantId: ctx.tenantId, id: departmentId });
    return ok({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid department id", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[departments/[id]][DELETE] Unexpected error:", error);
    return serverError();
  }
}
