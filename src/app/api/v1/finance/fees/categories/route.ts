import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { feeCategories } from "@/lib/db";
import { phase7ApiError } from "@/lib/phase7/finance";
import { withTenant } from "@/lib/rls";

const schema = z.object({ name: z.string().trim().min(1), description: z.string().optional(), displayOrder: z.number().int().optional() });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const categories = await withTenant(ctx.tenantId, (tx) => tx.select().from(feeCategories));
  return Response.json({ categories });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.write");
  try {
    const body = schema.parse(await request.json());
    const [category] = await withTenant(ctx.tenantId, (tx) => tx.insert(feeCategories).values({ tenantId: ctx.tenantId, ...body }).returning());
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}
