import { requirePermission } from "@/lib/auth/guards";
import { exportStudentPersonalData } from "@/lib/governance/retention";

export async function GET(_request: Request, context: { params: Promise<{ studentId: string }> }) {
  const ctx = await requirePermission("administration.privacy.manage");
  const { studentId } = await context.params;
  const data = await exportStudentPersonalData(ctx.tenantId, studentId);
  if (!data) return Response.json({ error: "Student not found" }, { status: 404 });
  return Response.json(data);
}
