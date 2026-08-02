import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { duplicateFeeStructure, phase7ApiError } from "@/lib/phase7/finance";

const schema = z.object({ academicYearId: z.string().uuid().nullable().optional(), academicYear: z.string().optional(), name: z.string().optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("finance.fees.write");
  try {
    const { id } = await context.params;
    const structure = await duplicateFeeStructure(ctx.tenantId, ctx.userId, id, schema.parse(await request.json()));
    return Response.json({ structure }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}
