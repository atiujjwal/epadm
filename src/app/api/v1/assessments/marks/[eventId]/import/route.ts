import { requirePermission } from "@/lib/auth/guards";
import { importMarksCsv, phase6ApiError } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ eventId: string }> };

export async function POST(request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.marks.write");
  const { eventId } = await params;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "CSV file is required" }, { status: 400 });
    return Response.json(await importMarksCsv(ctx.tenantId, ctx.userId, eventId, await file.text()));
  } catch (error) { return phase6ApiError(error); }
}
