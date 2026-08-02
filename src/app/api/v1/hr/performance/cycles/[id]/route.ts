import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.performance.read");
  const { id } = await context.params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const cycle = model.cycles.find((item) => item.id === id);
  if (!cycle) return Response.json({ error: "Cycle not found" }, { status: 404 });
  return Response.json({ cycle, reviews: model.reviews.filter((review) => review.cycleId === id) });
}
