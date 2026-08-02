import { requirePermission } from "@/lib/auth/guards";
import { getAccountingSummary } from "@/lib/phase7/finance";

export async function GET(request: Request) {
  const ctx = await requirePermission("finance.accounting.read");
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  return Response.json(await getAccountingSummary(ctx.tenantId, {
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    type: type === "income" || type === "expense" || type === "all" ? type : "all",
  }));
}
