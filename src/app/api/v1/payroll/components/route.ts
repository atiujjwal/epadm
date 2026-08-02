import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";

export async function GET() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return Response.json({ components: model.components });
}
