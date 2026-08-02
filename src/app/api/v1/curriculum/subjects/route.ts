import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";

export async function GET() {
  const ctx = await requirePermission("curriculum.read");
  return Response.json({ subjects: (await listCurriculum(ctx.tenantId)).subjects });
}
