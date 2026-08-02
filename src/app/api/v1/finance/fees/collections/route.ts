import { requirePermission } from "@/lib/auth/guards";
import { getCollectionsSummary } from "@/lib/phase7/finance";

export async function GET(request: Request) {
  const ctx = await requirePermission("finance.fees.read");
  const url = new URL(request.url);
  return Response.json(await getCollectionsSummary(ctx.tenantId, { from: url.searchParams.get("from") ?? undefined, to: url.searchParams.get("to") ?? undefined }));
}
