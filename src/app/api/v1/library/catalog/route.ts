import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { addLibraryTitle, listLibraryModel } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ title: z.string().min(1), author: z.string().nullable().optional(), isbn: z.string().nullable().optional(), publisher: z.string().nullable().optional(), subject: z.string().nullable().optional() });

export async function GET(request: Request) {
  const ctx = await requirePermission("library.read");
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  const model = await listLibraryModel(ctx.tenantId, search);
  return Response.json({ titles: model.titles, copies: model.copies });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("library.catalog.manage");
  try {
    const title = await addLibraryTitle(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ title }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}
