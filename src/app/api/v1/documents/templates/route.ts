import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel, seedDefaultDocumentTemplates } from "@/lib/phase11/documents";

export async function GET() {
  const ctx = await requirePermission("documents.read");
  await seedDefaultDocumentTemplates(ctx.tenantId);
  const model = await listDocumentsModel(ctx.tenantId);
  return Response.json({ templates: model.templates });
}
