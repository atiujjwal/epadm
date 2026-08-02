import { readFile } from "node:fs/promises";
import path from "node:path";
import { requirePermission } from "@/lib/auth/guards";
import { generatePayslip, getPayslipForStaff, phase8ApiError } from "@/lib/phase8/payroll";

export async function GET(_request: Request, context: { params: Promise<{ id: string; staffId: string }> }) {
  const ctx = await requirePermission("payroll.payslips.download");
  try {
    const { id, staffId } = await context.params;
    const slip = (await getPayslipForStaff(ctx.tenantId, id, staffId)) ?? (await generatePayslip(ctx.tenantId, ctx.userId, id, staffId));
    if (!slip.pdfUrl) return Response.json({ error: "Payslip PDF not generated" }, { status: 404 });
    const relative = slip.pdfUrl.replace(/^\/+/, "");
    const bytes = await readFile(path.join(process.cwd(), relative));
    return new Response(bytes, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename=\"payslip-${staffId}.pdf\"` } });
  } catch (error) {
    return phase8ApiError(error);
  }
}
