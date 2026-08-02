import { requirePermission } from "@/lib/auth/guards";
import { listLibraryModel } from "@/lib/phase9/library";

export async function GET() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return Response.json({ fines: model.fines });
}
