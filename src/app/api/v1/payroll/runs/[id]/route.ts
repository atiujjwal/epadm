import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("payroll.runs.read");
  const { id } = await context.params;
  const model = await listPayrollModel(ctx.tenantId);
  const run = model.runs.find((item) => item.id === id);
  if (!run) return Response.json({ error: "Payroll run not found" }, { status: 404 });
  return Response.json({ run, entries: model.entries.filter((entry) => entry.runId === id), lines: model.lines, payslips: model.payslips });
}
