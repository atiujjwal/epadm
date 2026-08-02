import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { addLibraryCopy, listLibraryModel } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ accession: z.string().nullable().optional(), barcode: z.string().nullable().optional(), location: z.string().nullable().optional(), shelf: z.string().nullable().optional(), purchasePricePaise: z.coerce.number().int().min(0).optional() });

export async function GET(_request: Request, { params }: { params: Promise<{ titleId: string }> }) {
  const ctx = await requirePermission("library.read");
  const { titleId } = await params;
  const model = await listLibraryModel(ctx.tenantId);
  return Response.json({ copies: model.copies.filter((copy) => copy.titleId === titleId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ titleId: string }> }) {
  const ctx = await requirePermission("library.catalog.manage");
  const { titleId } = await params;
  try {
    const copy = await addLibraryCopy(ctx.tenantId, ctx.userId, { titleId, ...schema.parse(await request.json()) });
    return Response.json({ copy }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}
