import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";

export async function GET() {
  const ctx = await requirePermission("payroll.statutory.read");
  const model = await listPayrollModel(ctx.tenantId);
  const summary = model.entries.reduce((acc, row) => {
    const lines = model.lines.filter((line) => line.entryId === row.id);
    acc.pf += lines.filter((line) => line.componentCode.startsWith("PF_")).reduce((sum, line) => sum + line.amountPaise, 0);
    acc.esi += lines.filter((line) => line.componentCode.startsWith("ESI_")).reduce((sum, line) => sum + line.amountPaise, 0);
    acc.pt += lines.filter((line) => line.componentCode === "PT").reduce((sum, line) => sum + line.amountPaise, 0);
    acc.tds += lines.filter((line) => line.componentCode === "TDS").reduce((sum, line) => sum + line.amountPaise, 0);
    return acc;
  }, { pf: 0, esi: 0, pt: 0, tds: 0 });
  return Response.json({ summary });
}
