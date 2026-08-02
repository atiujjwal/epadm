import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";

export async function GET(_request: Request, context: { params: Promise<{ id: string; entryId: string }> }) {
  const ctx = await requirePermission("payroll.runs.read");
  const { id, entryId } = await context.params;
  const model = await listPayrollModel(ctx.tenantId);
  const entry = model.entries.find((item) => item.runId === id && item.id === entryId);
  if (!entry) return Response.json({ error: "Payroll entry not found" }, { status: 404 });
  return Response.json({ entry, lines: model.lines.filter((line) => line.entryId === entryId) });
}
