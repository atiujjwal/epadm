import { requirePermission } from "@/lib/auth/guards";
import { listLibraryModel } from "@/lib/phase9/library";

export async function GET() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  const today = new Date().toISOString().slice(0, 10);
  return Response.json({ overdue: model.issues.filter((issue) => !issue.returnedAt && String(issue.dueDate) < today) });
}
