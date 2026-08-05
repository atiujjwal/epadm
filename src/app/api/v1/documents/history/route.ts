import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel } from "@/lib/phase11/documents";

export async function GET() {
  const ctx = await requirePermission("documents.read");
  const model = await listDocumentsModel(ctx.tenantId);
  return Response.json({ documents: model.documents });
}
