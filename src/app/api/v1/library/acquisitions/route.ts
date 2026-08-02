import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createAcquisition, listLibraryModel } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({
  vendorName: z.string().nullable().optional(),
  orderNumber: z.string().nullable().optional(),
  orderDate: z.string().nullable().optional(),
  items: z.array(z.object({ title: z.string().min(1), author: z.string().nullable().optional(), isbn: z.string().nullable().optional(), quantity: z.coerce.number().int().positive(), unitPricePaise: z.coerce.number().int().min(0).optional() })),
});

export async function GET() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return Response.json({ acquisitions: model.acquisitions, items: model.acquisitionItems });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("library.acquisitions.manage");
  try {
    const acquisition = await createAcquisition(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ acquisition }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}
