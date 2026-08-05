import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel, seedDefaultNotificationTemplates } from "@/lib/phase11/notifications";

export async function GET() {
  const ctx = await requirePermission("communications.read");
  await seedDefaultNotificationTemplates(ctx.tenantId);
  const model = await listCommunicationsModel(ctx.tenantId);
  return Response.json({ templates: model.templates });
}
