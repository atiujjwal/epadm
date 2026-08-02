import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.recruitment.read");
  const { id } = await context.params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const posting = model.postings.find((item) => item.id === id);
  if (!posting) return Response.json({ error: "Posting not found" }, { status: 404 });
  return Response.json({ posting, applications: model.applications.filter((item) => item.postingId === id), interviews: model.interviews, offers: model.offers });
}
