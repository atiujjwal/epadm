import { requirePermission } from "@/lib/auth/guards";
import { ensureLibrarySettings, listLibraryModel } from "@/lib/phase9/library";

export async function GET() {
  const ctx = await requirePermission("library.read");
  await ensureLibrarySettings(ctx.tenantId);
  const model = await listLibraryModel(ctx.tenantId);
  return Response.json({ settings: model.settings });
}
