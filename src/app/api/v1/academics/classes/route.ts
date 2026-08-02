import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel } from "@/lib/phase4/academics";

export async function GET() {
  const ctx = await requirePermission("academics.read");
  const model = await listAcademicModel(ctx.tenantId);
  return Response.json({ classes: model.classes, sections: model.sections });
}
