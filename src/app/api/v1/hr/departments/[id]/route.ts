import { requirePermission } from "@/lib/auth/guards";
import { deleteStaffDepartment, listStaffDepartments, updateStaffDepartment } from "@/lib/admin/registries";
import { departmentSchema } from "../route";
import { phase3ApiError } from "@/lib/phase3/api";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requirePermission("hr.departments.read"); const { id } = await params; const department = (await listStaffDepartments(ctx.tenantId)).find((item) => item.id === id); return department ? Response.json({ department }) : Response.json({ error: "Department not found" }, { status: 404 }); }
export async function PATCH(request: Request, { params }: Context) { const ctx = await requirePermission("hr.departments.update"); const { id } = await params; try { return Response.json({ department: await updateStaffDepartment({ tenantId: ctx.tenantId, actorUserId: ctx.userId, id, ...departmentSchema.parse(await request.json()) }) }); } catch (error) { return phase3ApiError(error); } }
export async function DELETE(_request: Request, { params }: Context) { const ctx = await requirePermission("hr.departments.archive"); const { id } = await params; try { return Response.json({ department: await deleteStaffDepartment({ tenantId: ctx.tenantId, id }) }); } catch (error) { return phase3ApiError(error); } }
