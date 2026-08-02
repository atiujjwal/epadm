import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createStaffDepartment, listStaffDepartments } from "@/lib/admin/registries";
import { phase3ApiError } from "@/lib/phase3/api";
export const departmentSchema = z.object({ code: z.string().trim().max(40).optional(), name: z.string().trim().min(2).max(120), description: z.string().trim().max(1000).optional(), headStaffId: z.string().uuid().optional(), status: z.enum(["active","inactive"]).optional(), vacancies: z.number().int().min(0).max(500).optional() });
export async function GET() { const ctx = await requirePermission("hr.departments.read"); return Response.json({ departments: await listStaffDepartments(ctx.tenantId) }); }
export async function POST(request: Request) { const ctx = await requirePermission("hr.departments.create"); try { return Response.json({ department: await createStaffDepartment({ tenantId: ctx.tenantId, actorUserId: ctx.userId, ...departmentSchema.parse(await request.json()) }) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
